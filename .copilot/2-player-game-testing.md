# 2-Player Chess Game Testing Plan

## Overview

This document outlines a comprehensive testing strategy for the multiplayer chess application, focusing on network reliability, race conditions, connection failures, and edge cases that can occur during real-time gameplay.

**Important: These tests only cover the client code, therefore they mock correct server bahviour**

---

## 1. Failure Modes & Edge Cases to Test

### 1.1 Connection & Network Issues

#### Client-Server Communication

- **Move not reaching server but client thinks it did**
  - Client sends move via SignalR invoke, network drops before server ACK
  - Client UI updates optimistically, server never processes the move
  - Expected: Client must ensure the server received the move, keep the client timer ticking down,
    and retry sending the move until it receives an ack from the server, (or a signal indicating
    the game ended during the disconnect (which closes the game entirely so perhaps no need to process)).
    When it receives the ack it'll update the client timer considering the timestamp on
    server's ack (when the server received the move).
- **Server ACK lost but move was processed**

  - Move successfully processed on server, ACK packet lost
  - Client times out waiting for response
  - Expected: The client must resend the move until it gets ack from server. If the server is unresponsive
    after the `autoResignTimeout` passes, consider the user has abandoned the game.

- **Client offline during opponent's move**

  - Opponent makes move while client network is down
  - Client reconnects with SignalR automatic reconnect
  - Expected: Client should sync game state on reconnection, receive missed moves and timer states

- **Partial connection (websocket open but degraded)**
  - High latency, packet loss, intermittent connectivity
  - Messages delayed or arriving out of order
  - Expected: Game should remain playable with visual indicators of connection quality. In this situation
    it's important for the timer to reflect the times the server receives the moves, the server is the
    source of truth. Client timers start/stop from the times the server receives each move.

#### SignalR Reconnection Scenarios

- **Connection lost mid-game**

  - SignalR triggers `onreconnecting` event
  - `reconnectionStatus` ref updates to show "Reconnecting..."
  - Expected: Show reconnection banner, pause timers, prevent new moves

- **Reconnection successful**

  - SignalR `onreconnected` fires
  - Expected: Sync game state, resume timers with server time, clear reconnection UI

- **Reconnection fails/timeout**

  - SignalR exhausts retry attempts
  - Expected: After the `autoResignTimeout` passes show the game ended (by abandonment) modal.

- **Both players disconnect simultaneously**
  - Network outage affects both sides
  - Expected: Server should handle gracefully, allow both to reconnect without auto-resign before
    `autoResignTimeout` passes for the one who disconnected earlier. in case both disconnected
    at the exactly the same time, the server will give a draw. This is more of a server test
    but client UI must reflect the lack of connection on user's side and game ending dialog
    after the `autoResignTimeout`.

### 1.2 Message Ordering & Duplication

#### Duplicate Message Handling

- **Receiving same move twice**

  - Server sends `PlayerMoved` event
  - Client sends ACK via `connectionStore.invoke("ack", wrapper.messageId)`
  - ACK lost or delayed, server resends the move
  - Expected: Client should ignore duplicate (check if `boardApi.getLastMove()?.san === gameUpdate.san`)

- **ACK sent but move arrives again before server receives ACK**

  - Client processes move, sends ACK
  - Server hasn't processed ACK yet, resends move
  - Expected: Client should track processed messageIds, ignore duplicates

- **Out-of-order move delivery**
  - Network reorders packets, moves arrive in wrong sequence
  - Expected: Client should validate move the ack timestamps, request resync if invalid

#### Race Conditions

- **Client makes move while receiving opponent's move**

  - Both players click nearly simultaneously
  - Client sends move, receives opponent move before ack
  - Expected: Since the ack will have a timestamp > opponent's move, client resyncs

- **Timer expiration during move transmission**

  - Player makes move with <1s remaining
  - Move sent but timer hits zero before server processes
  - Expected: Server determines validity based on server-side timer

- **Multiple timeout invocations**
  - Current code has interval calling `timeout` repeatedly until acknowledged
  - Multiple clients might spam timeout calls
  - Expected: If the server doesn't signal gameEnded. The client timer might've desynchronized.
    Tries syncing clocks. If server irresponsive (no connection), client waits until connection
    established to resync clocks or receive gameEnded.

### 1.3 Timer Synchronization

#### Clock Drift

- **Client timer drifts from server timer**

  - Client countdown runs faster/slower than server
  - After several moves, times diverge significantly
  - Expected: Sync with server on every `PlayerMoved` event via `syncWithServer()`

- **Timer sync message lost**

  - `GameUpdate` with `remainingTimeInMilliseconds` doesn't reach client
  - Client timer continues with potentially incorrect time
  - Expected: Request time sync periodically or on next move

- **Timer runs during disconnection**

  - Client disconnects, local timer keeps running
  - Server timer paused or continues differently
  - Expected: On reconnect, sync timer with authoritative server time

- **Timer starts/stops race condition**
  - `isPlayersTurn` toggles rapidly
  - Watch triggers interval creation before clearing previous one
  - Expected: Ensure only one interval active per timer, clear before creating new

### 1.4 Game State Synchronization

#### Board State Mismatch

- **Client and server boards diverge**

  - Missed move, incorrect PGN parsing, or client-side bug
  - Client shows different position than server
  - Expected: Periodic checksum validation, resync on mismatch

- **Captured pieces desynchronization**

  - Client calculates captured pieces from local board API
  - If board state differs, captured pieces incorrect
  - Expected: Validate against server-provided game state

#### Opponent Connection Status

- **OpponentConnectionLost event arrives late**

  - Opponent disconnects, server waits before notifying
  - Client might already see effects (no moves for 30+ seconds)
  - Expected: Show status immediately when event received, countdown `autoResignTimeout`
    while accounting for the latency of the signal

- **OpponentReconnected event while countdown active**

  - Timer counting down to auto-resign
  - Opponent reconnects with 5s remaining
  - Expected: Clear `secondsTillOpponentAutoResign`, cancel interval

- **Auto-resign triggered but opponent reconnects simultaneously**
  - Race condition: server processes auto-resign as reconnection happens
  - Expected: Server should atomically handle, one outcome wins. The client which
    is tested here shouldn't display gameEnded dialog before receiving the signal
    from the server, it might as well receive a move.

### 1.5 UI & Client-Side Edge Cases

#### Component Lifecycle

- **BoardApi not initialized when move arrives**

  - `PlayerMoved` event fires before `onBoardCreated` callback
  - `boardApi` is undefined, move cannot be applied
  - Expected: Queue events until board ready, or defer connection

- **Component unmounts during async operation**

  - User navigates away mid-game
  - Pending `invoke` calls resolve after unmount
  - Expected: Cancel pending operations, unregister event handlers in `onUnmounted`

#### Input Validation

- **Invalid move sent to server**

  - Client somehow sends illegal move (chessboard library bug, tampered client)
  - Server rejects move
  - Expected: Client should handle rejection, revert board state, show error

- **Move sent when not player's turn**

  - `isPlayersTurn` is false but user manages to trigger move
  - Server should reject
  - Expected: Chessboard should be `viewOnly` when not turn

- **Move sent after game ended**
  - `GameEnded` event received but user clicks move before `viewOnly` set
  - Expected: Ignore move, ensure `boardConfig.viewOnly = true` set immediately

### 1.6 Mocked Server Response Failures

#### Connection Drops & Errors

- **Server connection drops mid-game**

  - SignalR connection drops (simulated)
  - Client reconnects to mocked server
  - Expected: Client shows reconnection UI, successfully reconnects, syncs game state

- **Server invoke method returns error**
  - Mock server rejects `move`, `timeout`, or other invocation with error response
  - Expected: Client receives error from `invoke`, shows user-friendly message, allows retry

#### Simulated Server Latency

- **High mock server latency**

  - Mock server delays responses (200-500ms+)
  - UI feels sluggish, moves appear delayed
  - Expected: Show loading/processing indicator beside player name, until ack for his
    move is received. Keep the timers synchronized according to when the server receives
    the moves not when the user makes them.

---

## 2. Expected Behaviors & Recovery Strategies

### 2.1 Connection Failure Handling

- **Immediate Feedback**: Show reconnection banner within 1 second of disconnect
- **State Sync**: On reconnect, fetch full game state from server
- **Move Queue**: Consider queuing moves offline and sending on reconnect

### 2.2 Message Reliability (Client-Side)

- **ACK Handling**: Client properly sends ACKs for critical events (moves, game end) via `AckMessage` pattern
- **Duplicate Detection**: Client tracks processed messageIds, ignores duplicate events from mocked server
- **Retry Logic**: Client retries failed `invoke` calls with exponential backoff when mock returns error
- **Message order validation** Client keeps the timestamp of the last message it receives, if a
  message with later timestamp arrives, client resyncs game state with server to ensure correctness

### 2.3 Timer Synchronization (Client-Side)

- **Mock Server as Source of Truth**: Mock server provides authoritative timer values in responses
- **Client Sync**: Client syncs local timer on every `PlayerMoved` event from mock
- **Timeout Handling**: Client correctly detects local timeout, invokes server timeout endpoint to
  get gameEnded signal

### 2.4 Board State Management (Client-Side)

- **Mock Server Validation**: Mock server can reject moves, client must revert the move the user made in
  that case
- **Client Optimistic Updates**: Client shows move immediately, must revert if mock rejects
- **State Sync**: Client fetches game state from mock after reconnection
- **Resync Handling**: Client correctly processes full game state from mock `/getGameState` responses

### 2.5 Error Recovery

- **Auto Retry**: Network failures auto-retry with backoff
- **Manual Retry**: Show "Retry" button for persistent failures
- **Graceful Degradation**: Allow viewing board even if updates stop
- **Return to Lobby**: Offer escape hatch if game becomes unplayable

---

## 3. Testing Strategy

### 3.1 Unit Tests (Fast, Isolated)

#### Scope

- **Composables**: `useConnectionEvent`, `useAcknowledgeableEvent`, `useNetworkStatus`
- **Store Logic**: `connectionStore.invoke`, `connectionStore.on/off`
- **Timer Logic**: Timer countdown, sync, pause/resume
- **Utility Functions**: `formatMilliseconds`, move parsing, PGN validation

#### Tools

- **Vitest**: Fast, modern testing framework for Vue/Nuxt
- **@nuxt/test-utils**: Nuxt's official testing utilities with helpers like `mountSuspended`, `mockNuxtImport`
- **@vue/test-utils**: Mount components in isolation (included with @nuxt/test-utils)
- **happy-dom** or **jsdom**: DOM environment for tests
- **Mock SignalR**: Create mock `HubConnection` to simulate events

#### Setup

Follow the [Nuxt Unit Testing Setup](https://nuxt.com/docs/4.x/getting-started/testing#setup) guide.

Project-specific configuration:

- Unit tests in `app/**/*.{test,spec}.ts` run in node environment for speed
- Nuxt runtime tests in `tests/nuxt/**/*.{test,spec}.ts` for components using composables
- Mock SignalR connections in tests using `vi.mock('@microsoft/signalr')`

#### Example Tests

```typescript
// Test duplicate move detection (unit test in node environment)
describe("useAcknowledgeableEvent", () => {
  it("should ignore duplicate messages with same messageId", () => {
    const handler = vi.fn()
    const event = useAcknowledgeableEvent("PlayerMoved", handler)

    event({ messageId: 1, message: { san: "e4" } })
    event({ messageId: 1, message: { san: "e4" } }) // duplicate

    expect(handler).toHaveBeenCalledOnce()
  })
})

// Test timer component using @nuxt/test-utils (in Nuxt environment)
// tests/nuxt/timer.nuxt.spec.ts
import { mountSuspended } from "@nuxt/test-utils/runtime"
import Timer from "~/components/chess/Timer.vue"

describe("Timer", () => {
  it("should sync remaining time with server", async () => {
    const component = await mountSuspended(Timer, {
      props: { run: true, duration: 60000 },
    })

    await component.vm.syncWithServer(45000)

    expect(component.vm.msRemaining).toBe(45000)
  })
})

// Test network status detection (unit test)
describe("useNetworkStatus", () => {
  it("should detect offline when ping fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))

    const { isOnline, start } = useNetworkStatus()
    start()
    await vi.waitFor(() => expect(isOnline.value).toBe(false))
  })
})

// Mock Nuxt imports when testing composables
import { mockNuxtImport } from "@nuxt/test-utils/runtime"

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    public: { serverAddress: "http://localhost:5000" },
  })
})
```

#### Coverage Goals

- **Connection composables**: 90%+ coverage
- **Store logic**: 85%+ coverage
- **Timer component**: 90%+ coverage
- **Utility functions**: 95%+ coverage

### 3.2 Integration Tests (Realistic Scenarios)

#### Scope

- **Full game flow**: Setup → Join → Play → End (with mocked server)
- **Multi-component interaction**: Board + Timers + MoveRecord + CapturedPieces
- **Mock SignalR Server**: Programmatic control over server responses and events
- **Network condition simulation**: Latency, packet loss, disconnects (client-side effects)

#### Tools

- **@nuxt/test-utils/e2e**: Nuxt's E2E testing utilities with helpers like `setup`, `$fetch`, `createPage`
- **Playwright**: End-to-end browser automation (via @playwright/test)
- **Toxiproxy/TC**: Network condition simulation (latency, packet loss)
- **Mock SignalR Server**: Programmatic event injection for testing

#### Setup

Follow the [Nuxt E2E Testing with Playwright](https://nuxt.com/docs/4.x/getting-started/testing#testing-with-playwright-test-runner) guide.

Project-specific configuration:

- Test directory: `./tests/e2e`
- Use `@nuxt/test-utils/playwright` for `expect`, `test`, and `goto` utilities
- Tests should wait for Nuxt hydration: `await goto('/path', { waitUntil: 'hydration' })`
- Mock SignalR server responses for predictable testing
- Use Playwright's `context.setOffline()` to simulate network failures

#### Test Scenarios

##### Happy Path (Client UI/State)

1. Client creates game (mock server responds with game ID)
2. Client joins game (mock server provides game state)
3. Client sends moves, receives opponent moves from mock
4. Client timers count down correctly, sync with mock server times
5. Client captured pieces update based on board state
6. Client move record displays all moves in order
7. Client receives game end event from mock (checkmate/resignation)
8. Client result modal shows correct outcome

##### Network Disruption (Client Response)

1. **Temporary Disconnect**

   - Start game with mock server
   - Kill client network for 5 seconds (Playwright offline mode)
   - Verify client shows reconnection banner
   - Client reconnects to mock
   - Verify client requests game state and resumes correctly

2. **Opponent Disconnect Event**

   - Mock server sends `OpponentConnectionLost` event
   - Verify client shows "opponent disconnected" message
   - Verify client countdown to auto-resign starts
   - Mock server sends `OpponentReconnected` event
   - Verify client clears countdown, continues game

3. **Move During Client Disconnect**
   - Client's network drops
   - Mock server buffers opponent move
   - Client reconnects
   - Mock delivers buffered move
   - Verify client displays opponent's move correctly

##### Race Conditions (Client Handling)

1. **Simultaneous Move Attempt**

   - Client sends move to mock
   - Mock immediately sends opponent move before ACK
   - Mock sends ACK with timestamp showing opponent was first
   - Verify client reverts its move, applies opponent's move

2. **Move Near Timer Expiration**

   - Set client timer to 2 seconds
   - Client sends move with 0.5s remaining
   - Mock responds with rejection (timeout) or acceptance
   - Verify client handles both outcomes correctly

3. **Duplicate Move Events from Mock**
   - Mock server sends same `PlayerMoved` event twice
   - Verify client board only updates once
   - Verify no duplicate moves in client move history

##### State Synchronization (Client Logic)

1. **Reconnect with State Change**

   - Client starts game, makes 3 moves
   - Kill client connection (mock continues)
   - Mock simulates 2 opponent moves during disconnect
   - Client reconnects
   - Mock sends full game state (5 moves total)
   - Verify client correctly displays all 5 moves

2. **Timer Desync Recovery**
   - Manually drift client timer by 10 seconds
   - Client makes move to mock
   - Mock response includes correct timer value
   - Verify client timer corrects to match mock server time

##### Error Handling (Client Response)

1. **Invalid Move Rejection**

   - Client sends move to mock
   - Mock rejects with error response
   - Verify client shows error message to user
   - Verify client board state unchanged/reverted
   - Verify client allows retry

2. **Mock Server Error Response**
   - Mock returns error from `invoke('move')`
   - Verify client catches error, doesn't crash
   - Verify client shows user-friendly error message
   - Verify client game remains playable after error

#### Playwright Test Example

```typescript
// tests/e2e/game-reconnection.spec.ts
import { expect, test } from "@nuxt/test-utils/playwright"

test("should handle reconnection during game", async ({ page, goto, context }) => {
  // Setup: Create game and join (wait for Nuxt hydration)
  await goto("/game/test-id", { waitUntil: "hydration" })

  // Make some moves
  await page.click('[data-square="e2"]')
  await page.click('[data-square="e4"]')

  // Simulate network disconnect
  await context.setOffline(true)
  await expect(page.locator("text=Reconnecting...")).toBeVisible()

  // Reconnect after 3 seconds
  await page.waitForTimeout(3000)
  await context.setOffline(false)

  // Verify game state restored
  await expect(page.locator("text=Reconnecting...")).not.toBeVisible()
  await expect(page.locator(".move-record")).toContainText("e4")
})
```

### 3.3 Fuzz Testing (Bug Discovery)

#### Purpose

Fuzz testing generates random/malformed inputs to discover unexpected failures, edge cases, and security vulnerabilities that manual testing misses.

#### Approaches

##### 1. Protocol Fuzzing (SignalR Messages)

**Goal**: Send malformed/unexpected SignalR messages to test client resilience

**Implementation**:

- Intercept SignalR WebSocket connection
- Inject random message types, malformed JSON, unexpected fields
- Monitor for client crashes, exceptions, UI freezes

**Tools**:

- **Playwright + WebSocket intercept**: Modify messages in flight
- **Hypothesis** (Python) or **fast-check** (TypeScript): Property-based testing

**Example**:

```typescript
// Property-based test with fast-check
fc.assert(
  fc.property(
    fc.record({
      messageId: fc.integer(),
      message: fc.anything(), // random data
    }),
    (msg) => {
      const handler = vi.fn()
      const event = useAcknowledgeableEvent("PlayerMoved", handler)

      // Should not crash regardless of input
      expect(() => event(msg)).not.toThrow()
    }
  )
)
```

##### 2. Input Fuzzing (User Actions)

**Goal**: Random sequences of user actions to find UI bugs

**Implementation**:

- Generate random click/tap/keyboard sequences
- Random timing between actions (0-2000ms)
- Random network conditions (latency spikes, disconnects)
- Monitor for: crashes, UI freezes, state corruption, console errors

**Playwright Fuzzing**:

```typescript
test("fuzz test: random game actions", async ({ page }) => {
  await page.goto("/game/test-id")

  const actions = [
    () => page.click(".chessboard [data-square]"), // random square
    () => page.setOffline(true),
    () => page.setOffline(false),
    () => page.reload(),
    () => page.goBack(),
  ]

  for (let i = 0; i < 100; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)]
    await action().catch(() => {}) // ignore expected errors
    await page.waitForTimeout(Math.random() * 2000)

    // Check for crashes
    const errors = await page.evaluate(() => window.errors || [])
    expect(errors).toHaveLength(0)
  }
})
```

##### 3. Network Fuzzing

**Goal**: Random network conditions during gameplay

**Implementation**:

- Use Toxiproxy or tc (Linux) to inject faults:
  - Random latency (0-2000ms)
  - Packet loss (0-50%)
  - Bandwidth limits
  - Connection resets
- Run automated games under these conditions
- Monitor for: desyncs, crashes, unrecoverable errors

**Test Scenarios**:

- **Chaos Monkey**: Randomly disconnect/reconnect every 5-30 seconds
- **Latency Spikes**: Normal latency with occasional 500-2000ms spikes
- **Packet Loss Graduation**: Gradually increase packet loss from 0% to 50%
- **Bandwidth Throttling**: Limit to 56kbps, 3G speeds, etc.

##### 4. State Fuzzing

**Goal**: Random game states to test board/UI rendering

**Implementation**:

- Generate random PGN positions
- Random timer values (including negative, extreme values)
- Random captured pieces arrays
- Load into game page, verify no crashes

**Example**:

```typescript
fc.assert(
  fc.property(
    fc.record({
      pgn: fc.string(), // random PGN
      playerTime: fc.integer(-1000, 1000000),
      opponentTime: fc.integer(-1000, 1000000),
      captured: fc.array(fc.constantFrom("p", "n", "b", "r", "q")),
    }),
    (gameState) => {
      // Should handle any state without crashing
      const wrapper = mount(GamePage, {
        props: { game: gameState },
      })
      expect(wrapper.exists()).toBe(true)
    }
  )
)
```

##### 5. Timing Fuzzing

**Goal**: Find race conditions via random timing

**Implementation**:

- Run automated games with random delays
- Vary server response times (0-2000ms)
- Trigger multiple rapid actions (double-clicks, spam moves)
- Monitor for: duplicate moves, timer bugs, UI inconsistencies

#### Fuzz Testing Tools & Libraries

- **fast-check**: TypeScript property-based testing
- **Hypothesis**: Python property-based testing (if server tests needed)
- **AFL/LibFuzzer**: For native code fuzzing (unlikely needed here)
- **Chaos Engineering**: Toxiproxy, Pumba, Chaos Mesh
- **Playwright + Random**: Custom fuzz scripts with Playwright

#### Metrics & Monitoring

- **Crash Rate**: Any uncaught exceptions or freezes
- **Console Errors**: Monitor browser console for errors/warnings
- **State Corruption**: Periodic checksums of game state
- **Coverage**: Track code paths exercised by fuzz tests
- **Bug Discovery Rate**: Unique bugs found per hour of fuzzing

#### When to Run Fuzz Tests

- **Continuous**: Lightweight fuzzing in CI on every commit
- **Nightly**: Intensive 4-8 hour fuzz runs on dev environment
- **Pre-Release**: Comprehensive fuzz testing before major releases
- **After Bugs Found**: Add regression fuzz tests for fixed bugs

---

## 4. Test Implementation Plan

### Phase 1: Unit Tests (Week 1)

- [x] Setup Nuxt testing utils
- [ ] Write tests for connection composables
- [ ] Write tests for timer component
- [ ] Write tests for network status
- [ ] Write tests for store logic
- [ ] Achieve 85%+ unit test coverage

### Phase 2: Integration Tests - Happy Path (Week 2)

- [x] Set up Playwright
- [ ] Create test game creation flow
- [ ] Test full game playthrough
- [ ] Test timer countdown and game end
- [ ] Test move record and captured pieces updates

### Phase 3: Integration Tests - Network Failures (Week 3)

- [ ] Set up Toxiproxy or network simulation
- [ ] Test reconnection scenarios
- [ ] Test opponent disconnect/reconnect
- [ ] Test move during disconnect
- [ ] Test offline banner behavior

### Phase 4: Integration Tests - Race Conditions (Week 4)

- [ ] Test simultaneous moves
- [ ] Test duplicate message handling
- [ ] Test move near timer expiration
- [ ] Test rapid state changes
- [ ] Test multiple timeout invocations

### Phase 5: Fuzz Testing Framework (Week 5)

- [ ] Set up fast-check for property-based testing
- [ ] Implement protocol fuzzing
- [ ] Implement input fuzzing with Playwright
- [ ] Set up chaos engineering (Toxiproxy)
- [ ] Create fuzz test monitoring dashboard

### Phase 6: Continuous Testing (Ongoing)

- [ ] Integrate tests into CI/CD pipeline
- [ ] Set up nightly fuzz test runs
- [ ] Configure test coverage reporting
- [ ] Create bug tracking for fuzz-discovered issues
- [ ] Regular test maintenance and expansion

---

## 5. Testing Environments

### Local Development

- Full test suite runs locally
- Mock SignalR server for fast iteration
- Network simulation via browser DevTools/Playwright offline mode

### CI/CD Pipeline

- Unit tests on every commit (< 2 min)
- Integration tests with mock server on PR (< 10 min)
- Full test suite on merge to main (< 30 min)

### Integration Testing Environment

- E2E tests with mock SignalR server
- Network condition simulation (Toxiproxy, Playwright)
- Client-side performance and stress testing
- Fuzz testing runs

### Production Monitoring (Client-Side)

- Real User Monitoring (RUM) for client performance
- Error tracking (Sentry) for client-side errors
- Client performance monitoring (Core Web Vitals)
- Client-side crash/exception reporting

---

## 6. Success Criteria

### Test Coverage (Client Code)

- Unit tests: 85%+ line coverage of client composables, components, stores
- Integration tests: All critical UI/state paths covered
- Fuzz tests: 8+ hours/week, zero critical client bugs

### Client Reliability Metrics

- Client crash rate: <0.1% (no uncaught exceptions)
- Client reconnection handling: >95% success (with mock server)
- UI responsiveness: No freezes during network issues
- Client state consistency: Zero desyncs in tests

### Bug Discovery (Client-Side)

- All known client edge cases have regression tests
- Fuzz testing discovers <1 client bug per month (after initial period)
- No P0/P1 client bugs escape to production

---

## 7. Open Questions & Future Work

### Questions to Resolve (Client-Side)

1. Should client persist game state locally (localStorage) for offline resilience?
2. How should client UI communicate `autoResignTimeout` countdown to user?
3. Should client show move confirmation dialog for high-latency connections?
4. How should client handle browser tab sleep/background throttling (timer pause/resume)?
5. What level of mock server fidelity is needed for realistic testing?

### Future Enhancements (Client-Side)

1. **Client-Side Optimistic Rollback**: Better UX for rejected moves with smooth revert animation
2. **Local State Persistence**: IndexedDB/localStorage for game state resilience
3. **Service Worker**: Offline support and background sync
4. **Client Replay System**: Record and replay client-side events for debugging
5. **Performance Profiling**: Client-side performance under various network conditions

---

## Appendix: Tools & Resources

### Testing Frameworks

- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **fast-check**: https://github.com/dubzzz/fast-check

### Network Simulation

- **Toxiproxy**: https://github.com/Shopify/toxiproxy
- **tc (Linux)**: Traffic control for network emulation
- **Playwright Network**: `page.route()` for request interception

### Monitoring

- **Sentry**: Error tracking
- **Grafana + Prometheus**: Metrics and dashboards
- **Lighthouse**: Performance monitoring

### Documentation

- **SignalR Docs**: https://docs.microsoft.com/en-us/aspnet/core/signalr/
- **Vue Test Utils**: https://test-utils.vuejs.org/
- **Chaos Engineering**: https://principlesofchaos.org/

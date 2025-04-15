import { H3Event, type EventHandlerRequest } from "h3"

export default async function (event: H3Event<EventHandlerRequest>) {
  console.log("inside event")
  const serverAddress = process.env.SERVER_ADDRESS!
  console.log("proxyUrl: ", serverAddress + event.path)
  const target = serverAddress + event.path
  console.log("target: ", target)

  try {
    const res = await proxyRequest(event, target, {
      fetchOptions: {
        credentials: "include",
      },
      cookieDomainRewrite: "nietzschess.xyz",
    })
    console.log("res: ", res)
    return res
  } catch (e) {
    console.log("proxy error: ", e)
  }
}

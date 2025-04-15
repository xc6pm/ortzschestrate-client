import proxyToServer from "~/utils/proxyToServer"

export default defineEventHandler(async (event) => {
  return proxyToServer(event)
})

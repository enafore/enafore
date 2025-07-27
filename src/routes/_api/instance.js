import { get, DEFAULT_TIMEOUT } from '../_utils/ajax.js'
import { auth, basename } from './utils.js'

export async function getInstanceInfo (instanceName, accessToken) {
  // accessToken is required in limited federation mode, but elsewhere we don't need it (e.g. during login)
  const headers = accessToken ? auth(accessToken) : null
  let instance
  const controller = new AbortController()
  const v2Instance = get(`${basename(instanceName)}/api/v2/instance`, headers, { timeout: DEFAULT_TIMEOUT })
  const v1Instance = get(`${basename(instanceName)}/api/v1/instance`, headers, { timeout: DEFAULT_TIMEOUT, signal: controller.signal })
  v2Instance.catch(() => {})
  v1Instance.catch(() => {})
  try {
    instance = await v2Instance
    controller.abort()
  } catch (e) {
    instance = await v1Instance
  }
  instance.nodeInfo = null
  try {
    const nodeInfo = await get(`${basename(instanceName)}/.well-known/nodeinfo`, headers, { timeout: DEFAULT_TIMEOUT })
    let nodeInfo21, nodeInfo20
    for (const link of nodeInfo.links) {
      if (link.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.1') {
        nodeInfo21 = link.href
      } else if (link.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.0') {
        nodeInfo20 = link.href
      }
    }
    const realNodeInfo = await get(nodeInfo21 || nodeInfo20, {}, { timeout: DEFAULT_TIMEOUT })
    instance.nodeInfo = realNodeInfo
  } catch (e) {
    if (instance.pleroma) {
      console.warn('failed to get nodeInfo', e)
    }
  }
  return instance
}

import { get, DEFAULT_TIMEOUT } from '../_utils/ajax.js'
import { auth, basename } from './utils.js'

export async function getInstanceInfo (instanceName, accessToken) {
  const url = `${basename(instanceName)}/api/v2/instance`
  // accessToken is required in limited federation mode, but elsewhere we don't need it (e.g. during login)
  const headers = accessToken ? auth(accessToken) : null
  const instance = await get(url, headers, { timeout: DEFAULT_TIMEOUT })
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

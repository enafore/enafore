import QuickLRU from 'quick-lru'

export const statusesCache = {
  maxSize: 100,
  caches: {}
}
export const accountsCache = {
  maxSize: 50,
  caches: {}
}
export const relationshipsCache = {
  maxSize: 20,
  caches: {}
}
export const metaCache = {
  maxSize: 20,
  caches: {}
}
export const notificationsCache = {
  maxSize: 50,
  caches: {}
}

if (process.browser && process.env.NODE_ENV !== 'production') {
  window.cacheStats = {
    statuses: statusesCache,
    accounts: accountsCache,
    relationships: relationshipsCache,
    meta: metaCache,
    notifications: notificationsCache
  }
}

function getOrCreateInstanceCache (cache, instanceName) {
  let cached = cache.caches[instanceName]
  if (!cached) {
    cached = cache.caches[instanceName] = new QuickLRU({maxSize: cache.maxSize})
  }
  return cached
}

export function clearCache (cache, instanceName) {
  delete cache.caches[instanceName]
}
export function setInCache (cache, instanceName, key, value) {
  let instanceCache = getOrCreateInstanceCache(cache, instanceName)
  return instanceCache.set(key, value)
}

export function getInCache (cache, instanceName, key) {
  let instanceCache = getOrCreateInstanceCache(cache, instanceName)
  return instanceCache.get(key)
}

export function hasInCache (cache, instanceName, key) {
  let instanceCache = getOrCreateInstanceCache(cache, instanceName)
  let res = instanceCache.has(key)
  if (process.env.NODE_ENV !== 'production') {
    if (res) {
      cache.hits = (cache.hits || 0) + 1
    } else {
      cache.misses = (cache.misses || 0) + 1
    }
  }
  return res
}

export function deleteFromCache (cache, instanceName, key) {
  let instanceCache = getOrCreateInstanceCache(cache, instanceName)
  instanceCache.delete(key)
}

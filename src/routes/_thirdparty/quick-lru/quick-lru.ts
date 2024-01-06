// Forked from https://github.com/sindresorhus/quick-lru/blob/16d15d470a8eb87c2a7dd5b80892d9b74f1acd3c/index.js
// removes some unused code

export class QuickLRU<KeyType, ValueType> {
  maxSize: number;
  cache: Map<KeyType, ValueType>;
  oldCache: Map<KeyType, ValueType>;
  _size: number;
  constructor(options: { maxSize?: number } = {}) {
    if (!(options.maxSize && options.maxSize > 0)) {
      throw new TypeError('`maxSize` must be a number greater than 0')
    }

    this.maxSize = options.maxSize
    this.cache = new Map()
    this.oldCache = new Map()
    this._size = 0
  }

  _set(key: KeyType, value: ValueType) {
    this.cache.set(key, value)
    this._size++

    if (this._size >= this.maxSize) {
      this._size = 0
      this.oldCache = this.cache
      this.cache = new Map()
    }
  }

  get(key: KeyType) {
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    if (this.oldCache.has(key)) {
      const value = this.oldCache.get(key)!
      this.oldCache.delete(key)
      this._set(key, value)
      return value
    }
  }

  set(key: KeyType, value: ValueType) {
    if (this.cache.has(key)) {
      this.cache.set(key, value)
    } else {
      this._set(key, value)
    }

    return this
  }

  has(key: KeyType) {
    return this.cache.has(key) || this.oldCache.has(key)
  }

  // unused
  // peek (key) {
  //   if (this.cache.has(key)) {
  //     return this.cache.get(key)
  //   }
  //
  //   if (this.oldCache.has(key)) {
  //     return this.oldCache.get(key)
  //   }
  // }

  delete(key: KeyType) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this._size--
    }

    return this.oldCache.delete(key) || deleted
  }

  clear() {
    this.cache.clear()
    this.oldCache.clear()
    this._size = 0
  }

  getAllKeys() {
    const set = new Set()
    for (const key of this.cache.keys()) {
      set.add(key)
    }
    for (const key of this.oldCache.keys()) {
      set.add(key)
    }
    return set
  }

  // unused
  // * keys() {
  //   for (const [key] of this) {
  //     yield key;
  //   }
  // }
  //
  // * values() {
  //   for (const [, value] of this) {
  //     yield value;
  //   }
  // }
  //
  // * [Symbol.iterator]() {
  //   for (const item of this.cache) {
  //     yield item;
  //   }
  //
  //   for (const item of this.oldCache) {
  //     const [key] = item;
  //     if (!this.cache.has(key)) {
  //       yield item;
  //     }
  //   }
  // }
  //
  // get size () {
  //   let oldCacheSize = 0
  //   for (const key of this.oldCache.keys()) {
  //     if (!this.cache.has(key)) {
  //       oldCacheSize++
  //     }
  //   }
  //
  //   return this._size + oldCacheSize
  // }
}

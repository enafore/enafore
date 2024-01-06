
import { type DefaultTreeAdapterMap, defaultTreeAdapter, html } from 'parse5'
const { NS: { HTML } } = html
declare const document: never

function normalizeHashtag(hashtag: string) {
  return (
    hashtag && hashtag.startsWith('#') ? hashtag.slice(1) : hashtag
  ).normalize('NFKC')
}

function isNodeLinkHashtag(element: DefaultTreeAdapterMap["element"]) {
  if (element.tagName === 'a') {
    const c = element.attrs.find(attr => attr.name === "class")
    if (c) {
      return c.value.split(/\s+/g).includes('hashtag')
    }
  }
  return false
}

/**
 * Removes duplicates from an hashtag list, case-insensitive, keeping only the best one
 * "Best" here is defined by the one with the more casing difference (ie, the most camel-cased one)
 * @param hashtags The list of hashtags
 * @returns The input hashtags, but with only 1 occurence of each (case-insensitive)
 */
function uniqueHashtagsWithCaseHandling(hashtags: string[]) {
  const groups = hashtags.reduce<{ [_: string]: string[] }>((obj, tag) => {
    const normalizedTag = tag.normalize('NFKD').toLowerCase();
    (obj[normalizedTag] = obj[normalizedTag] || []).push(tag)
    return obj
  }, {})

  return Object.values(groups).map((tags) => tags[0])
}

// Create the collator once, this is much more efficient
const collator = new Intl.Collator(undefined, {
  sensitivity: 'base' // we use this to emulate the ASCII folding done on the server-side, hopefuly more efficiently
})

function localeAwareInclude(collection: string[], value: string) {
  const normalizedValue = value.normalize('NFKC')

  return !!collection.find(
    (item) => collator.compare(item.normalize('NFKC'), normalizedValue) === 0
  )
}

function walkElements(node: DefaultTreeAdapterMap["parentNode"], callback: ((node: DefaultTreeAdapterMap["element"]) => unknown)) {
  for(const child of node.childNodes) {
    if(defaultTreeAdapter.isElementNode(child)) {
      callback(child)
      walkElements(child, callback)
    }
  }
}

export function computeHashtagBarForStatus(dom: DefaultTreeAdapterMap["parentNode"], status: any) {
  // this is returned if we stop the processing early, it does not change what is displayed
  const defaultResult: {
    dom: DefaultTreeAdapterMap["parentNode"],
    hashtagsInBar: string[]
  } = {
    dom,
    hashtagsInBar: []
  }

  // return early if this status does not have any tags
  if (!(status.tags && status.tags.length > 0)) {
    return defaultResult
  }

  const tagNames: string[] = status.tags.map((tag: any) => tag.name)
  const normalizedTagNames = tagNames.map((tag) => tag.normalize('NFKC'))

  const isValidNode = (node: DefaultTreeAdapterMap["node"]) => {
    if (!node) {
      return false
    }
    if (defaultTreeAdapter.isElementNode(node) && isNodeLinkHashtag(node) && node.childNodes.length === 1 && defaultTreeAdapter.isTextNode(node.childNodes[0])) {
      const normalized = normalizeHashtag(node.childNodes[0].value)
      if (!localeAwareInclude(normalizedTagNames, normalized)) {
        // stop here, this is not a real hashtag, so consider it as text
        return false
      }
      return normalized
    } else if (!defaultTreeAdapter.isTextNode(node) || node.value?.trim()) {
      // not a space
      return false
    } else {
      // spaces
      return true
    }
  }

  if (dom.childNodes.length) {
    let toRemove: DefaultTreeAdapterMap["childNode"][] = []
    let parent = dom;
    a: while (parent.childNodes.length) {
      const lc = parent.childNodes[parent.childNodes.length - 1]
      if (isValidNode(lc)) {
        for (let i = parent.childNodes.length - 1; i > -1; i--) {
          const node = parent.childNodes[i]
          if ((defaultTreeAdapter.isElementNode(node) && node.tagName === "br") || (defaultTreeAdapter.isTextNode(node) && node.value.includes('\n'))) {
            toRemove.push(node)
            break
          }
          const tag = isValidNode(node)
          if (tag) {
            toRemove.push(node)
          } else {
            toRemove = []
            break a;
          }
        }
        break;
      } else if(defaultTreeAdapter.isElementNode(lc)) {
        parent = lc
      } else {
        break
      }
    }
    for (const node of toRemove) {
      defaultTreeAdapter.detachNode(node)
    }
    if(parent !== dom && !parent.childNodes.length) {
      defaultTreeAdapter.detachNode(parent as (DefaultTreeAdapterMap["childNode"] & DefaultTreeAdapterMap["parentNode"]))
    }
  }

  let contentHashtags: string[] = []
  walkElements(dom, (ele) => {
    const tag = isValidNode(ele)
    if(typeof tag === "string") {
      contentHashtags.push(tag)
    }
  })

  const hashtagsInBar = tagNames.filter((tag, i) => {
    const normalizedTag = normalizedTagNames[i]
    return !localeAwareInclude(contentHashtags, normalizedTag)
  })

  return {
    dom,
    hashtagsInBar: uniqueHashtagsWithCaseHandling(hashtagsInBar)
  }
}

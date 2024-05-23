import { type DefaultTreeAdapterMap, defaultTreeAdapter } from 'parse5'

function normalizeHashtag(hashtag: string): string {
  return (
    hashtag !== '' && hashtag.startsWith('#') ? hashtag.slice(1) : hashtag
  ).normalize('NFKC')
}

function isNodeLinkHashtag(element: DefaultTreeAdapterMap['element']): boolean {
  if (element.tagName === 'a') {
    const c = element.attrs.find((attr) => attr.name === 'class')
    const r = element.attrs.find((attr) => attr.name === 'rel')
    const h = element.attrs.find((attr) => attr.name === 'href')
    return (
      !!c?.value.split(/\s+/g).includes('hashtag') ||
      !!r?.value.split(/\s+/g).includes('tag') ||
      !!h?.value?.match(/\/tags\/[^\/]+$|\/search\?tag=/) // GtS and Friendica, respectively
    )
  }
  return false
}

/**
 * Removes duplicates from an hashtag list, case-insensitive, keeping only the best one
 * "Best" here is defined by the one with the more casing difference (ie, the most camel-cased one)
 * @param hashtags The list of hashtags
 * @returns The input hashtags, but with only 1 occurence of each (case-insensitive)
 */
function uniqueHashtagsWithCaseHandling(hashtags: string[]): string[] {
  const groups = hashtags.reduce<{ [_: string]: [string, ...string[]] }>(
    (obj, tag) => {
      const normalizedTag = normalizeHashtag(tag).toLowerCase()
      const array = obj[normalizedTag]
      if (array) {
        array.push(tag)
      } else {
        obj[normalizedTag] = [tag]
      }
      return obj
    },
    {},
  )

  return Object.values(groups).map((tags) => tags[0])
}

// Create the collator once, this is much more efficient
const collator = new Intl.Collator(undefined, {
  sensitivity: 'base', // we use this to emulate the ASCII folding done on the server-side, hopefuly more efficiently
})

function localeAwareInclude(collection: string[], value: string): boolean {
  const normalizedValue = value.normalize('NFKC')

  return Boolean(
    collection.find(
      (item) => collator.compare(item.normalize('NFKC'), normalizedValue) === 0,
    ),
  )
}

function walkElements(
  node: DefaultTreeAdapterMap['parentNode'],
  callback: (node: DefaultTreeAdapterMap['element']) => unknown,
): void {
  for (const child of node.childNodes) {
    if (defaultTreeAdapter.isElementNode(child)) {
      callback(child)
      walkElements(child, callback)
    }
  }
}

function textContent(node: DefaultTreeAdapterMap['parentNode']): string[] {
  let text = []
  for (const child of node.childNodes) {
    if (defaultTreeAdapter.isTextNode(child)) {
      text.push(child.value)
    } else if ('childNodes' in child) {
      text.push(...textContent(child))
    }
  }
  return text
}

export const isValidHashtagNode = (
  node: DefaultTreeAdapterMap['node'],
  normalizedTagNames: string[],
) => {
  if (!node) {
    return false
  }
  let text: string
  if (
    defaultTreeAdapter.isElementNode(node) &&
    isNodeLinkHashtag(node) &&
    (text = textContent(node).join(''))
  ) {
    const normalized = normalizeHashtag(text)
    if (!localeAwareInclude(normalizedTagNames, normalized)) {
      // stop here, this is not a real hashtag, so consider it as text
      return false
    }
    return normalized
  } else if (!defaultTreeAdapter.isTextNode(node) || node.value.trim()) {
    // not a space
    return false
  } else {
    // spaces
    return true
  }
}

export function computeHashtagBarForStatus(
  dom: DefaultTreeAdapterMap['parentNode'],
  status: any,
): {
  dom: DefaultTreeAdapterMap['parentNode']
  hashtagsInBar: string[]
} {
  // this is returned if we stop the processing early, it does not change what is displayed
  const defaultResult: {
    dom: DefaultTreeAdapterMap['parentNode']
    hashtagsInBar: string[]
  } = {
    dom,
    hashtagsInBar: [],
  }

  // return early if this status does not have any tags
  if (!(status.tags && status.tags.length > 0)) {
    return defaultResult
  }

  const normalizedTagNames: string[] = status.tags.map((tag: any) =>
    tag.name.normalize('NFKC'),
  )

  const hashtagsInBar = []

  if (dom.childNodes.length > 0) {
    let toRemove: Array<DefaultTreeAdapterMap['childNode']> = []
    let toAddToBar: string[] = []
    let parent = dom
    a: while (parent.childNodes.length > 0) {
      const lc = parent.childNodes[parent.childNodes.length - 1]!
      if (isValidHashtagNode(lc, normalizedTagNames)) {
        for (let i = parent.childNodes.length - 1; i > -1; i--) {
          const node = parent.childNodes[i]!
          if (
            (defaultTreeAdapter.isElementNode(node) && node.tagName === 'br') ||
            (defaultTreeAdapter.isTextNode(node) && node.value.includes('\n'))
          ) {
            toRemove.push(node)
            break
          }
          const tag = isValidHashtagNode(node, normalizedTagNames)
          if (tag) {
            toRemove.push(node)
            if (typeof tag === 'string') {
              toAddToBar.push(tag)
            }
          } else {
            toRemove = []
            toAddToBar = []
            break a
          }
        }
        break
      } else if (defaultTreeAdapter.isElementNode(lc)) {
        parent = lc
      } else {
        break
      }
    }
    for (const node of toRemove) {
      defaultTreeAdapter.detachNode(node)
    }
    hashtagsInBar.push(...toAddToBar)
    if (parent !== dom && parent.childNodes.length === 0) {
      defaultTreeAdapter.detachNode(
        parent as DefaultTreeAdapterMap['childNode'] &
          DefaultTreeAdapterMap['parentNode'],
      )
    }
  }

  const contentHashtags: string[] = []
  walkElements(dom, (ele) => {
    const tag = isValidHashtagNode(ele, normalizedTagNames)
    if (typeof tag === 'string') {
      contentHashtags.push(tag)
    }
  })

  hashtagsInBar.push(
    ...normalizedTagNames.filter((tag) => {
      return !localeAwareInclude(contentHashtags, tag)
    }),
  )

  return {
    dom,
    hashtagsInBar: uniqueHashtagsWithCaseHandling(hashtagsInBar),
  }
}

import { type DefaultTreeAdapterMap, defaultTreeAdapter } from 'parse5'

export function normalizeHashtag(hashtag: string): string {
  return (
    hashtag !== '' && hashtag.startsWith('#') ? hashtag.slice(1) : hashtag
  ).normalize('NFKC')
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

export function localeAwareInclude(
  collection: string[],
  value: string,
): boolean {
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

const isValidHashtagNode = (
  node: DefaultTreeAdapterMap['node'],
  normalizedTagNames: string[],
  wafrnTags: Map<string, string>,
) => {
  if (!node) {
    return false
  }
  let text: string | undefined
  if (
    defaultTreeAdapter.isElementNode(node) &&
    (text = node.attrs.find((attr) => attr.name === 'data-tag')?.value)
  ) {
    let wafrnTag
    if (
      (wafrnTag = node.attrs.find((attr) => attr.name === 'data-wafrn-tag'))
    ) {
      wafrnTags.set(text, wafrnTag.value)
    }
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
  hashtagsInBar: { display?: string; value: string }[]
} {
  // this is returned if we stop the processing early, it does not change what is displayed
  const defaultResult: {
    dom: DefaultTreeAdapterMap['parentNode']
    hashtagsInBar: { display?: string; value: string }[]
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

  let hashtagsInBar = []
  const wafrnTags = new Map<string, string>()

  if (dom.childNodes.length > 0) {
    let toRemove: Array<DefaultTreeAdapterMap['childNode']> = []
    let toAddToBar: string[] = []
    let parent = dom
    a: while (parent.childNodes.length > 0) {
      const lc = parent.childNodes[parent.childNodes.length - 1]!
      if (isValidHashtagNode(lc, normalizedTagNames, wafrnTags)) {
        for (let i = parent.childNodes.length - 1; i > -1; i--) {
          const lastSibling = parent.childNodes[i - 1]
          const node = parent.childNodes[i]!
          // Sharkey
          if (
            defaultTreeAdapter.isElementNode(node) &&
            node.tagName === 'span'
          ) {
            const lastChild = node.childNodes[node.childNodes.length - 1]
            if (
              lastChild &&
              defaultTreeAdapter.isElementNode(lastChild) &&
              lastChild.tagName === 'br'
            ) {
              toRemove.push(lastChild)
              break
            }
          }
          if (
            // Pleroma / Akkoma
            (defaultTreeAdapter.isElementNode(node) && node.tagName === 'br') ||
            // Generic
            (defaultTreeAdapter.isTextNode(node) &&
              (node.value.includes('\n') ||
                // Wafrn
                (node.value.trim().length === 0 &&
                  lastSibling &&
                  defaultTreeAdapter.isElementNode(lastSibling) &&
                  lastSibling.tagName === 'p')))
          ) {
            toRemove.push(node)
            break
          }
          const tag = isValidHashtagNode(node, normalizedTagNames, wafrnTags)
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
    const tag = isValidHashtagNode(ele, normalizedTagNames, wafrnTags)
    if (typeof tag === 'string') {
      contentHashtags.push(tag)
    }
  })

  hashtagsInBar.push(
    ...normalizedTagNames.filter((tag) => {
      return !localeAwareInclude(contentHashtags, tag)
    }),
  )

  hashtagsInBar = uniqueHashtagsWithCaseHandling(hashtagsInBar)

  return {
    dom,
    hashtagsInBar: wafrnTags.size
      ? hashtagsInBar.map((tag) => {
          const wafrnTag = wafrnTags.get(tag)
          const tagObject: { value: string; display?: string } = { value: tag }
          if (wafrnTag) {
            tagObject.display = wafrnTag
          }
          return tagObject
        })
      : hashtagsInBar.map((tag) => {
          return { value: tag }
        }),
  }
}

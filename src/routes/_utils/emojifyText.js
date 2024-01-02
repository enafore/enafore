import { renderPostHTML } from './renderPostHTML.js'

export function emojifyText (
  text,
  emojis,
  autoplayGifs
) {
  const emojisMap = new Map()
  if (emojis) {
    for (const emoji of emojis) {
      emojisMap.set(emoji.shortcode, emoji)
    }
  }
  return renderPostHTML({
    content: text,
    tags: [],
    autoplayGifs,
    emojis: emojisMap,
    mentionsByURL: new Map()
  }).innerHTML
}

import { QuickLRU } from '../_thirdparty/quick-lru/quick-lru.ts'
import { store } from '../_store/store.js'
const cache = new QuickLRU({ maxSize: 500 })
function isEmojiSupported (unicode) {
  if (cache.has(unicode)) {
    return cache.get(unicode)
  }
  const supported = isSupported(unicode)
  cache.set(unicode, supported)
  return supported
}
const isSupported = (function () {
  let ctx = null
  try {
    ctx = document.createElement('canvas').getContext('2d')
  } catch (_a) { }
  // Not in browser env
  if (!ctx) {
    return function () { return false }
  }
  const CANVAS_HEIGHT = 25
  const CANVAS_WIDTH = 20
  const textSize = Math.floor(CANVAS_HEIGHT / 2)
  // Initialize convas context
  ctx.font = textSize + 'px CountryFlagEmojiPolyfill, PinaforeEmoji, \'Noto Color Emoji\', Arial, Sans-Serif'
  ctx.textBaseline = 'top'
  ctx.canvas.width = CANVAS_WIDTH * 2
  ctx.canvas.height = CANVAS_HEIGHT
  return function (unicode) {
    ctx.clearRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT)
    // Draw in red on the left
    ctx.fillStyle = '#FF0000'
    ctx.fillText(unicode, 0, 22)
    // Draw in blue on right
    ctx.fillStyle = '#0000FF'
    ctx.fillText(unicode, CANVAS_WIDTH, 22)
    const a = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data
    const count = a.length
    let i = 0
    // Search the first visible pixel
    for (; i < count && !a[i + 3]; i += 4)
      ;
    // No visible pixel
    if (i >= count) {
      return false
    }
    // Emoji has immutable color, so we check the color of the emoji in two different colors
    // the result show be the same.
    const x = CANVAS_WIDTH + ((i / 4) % CANVAS_WIDTH)
    const y = Math.floor(i / 4 / CANVAS_WIDTH)
    const b = ctx.getImageData(x, y, 1, 1).data
    if (a[i] !== b[0] || a[i + 2] !== b[2]) {
      return false
    }
    // Some emojis are a contraction of different ones, so if it's not
    // supported, it will show multiple characters
    if (ctx.measureText(unicode).width >= CANVAS_WIDTH) {
      return false
    }
    // Supported
    return true
  }
})()

const COUNTRY_FLAG_EMOJI = new Set(
  [
    '🇦🇨',
    '🇦🇩',
    '🇦🇪',
    '🇦🇫',
    '🇦🇬',
    '🇦🇮',
    '🇦🇱',
    '🇦🇲',
    '🇦🇴',
    '🇦🇶',
    '🇦🇷',
    '🇦🇸',
    '🇦🇹',
    '🇦🇺',
    '🇦🇼',
    '🇦🇽',
    '🇦🇿',
    '🇧🇦',
    '🇧🇧',
    '🇧🇩',
    '🇧🇪',
    '🇧🇫',
    '🇧🇬',
    '🇧🇭',
    '🇧🇮',
    '🇧🇯',
    '🇧🇱',
    '🇧🇲',
    '🇧🇳',
    '🇧🇴',
    '🇧🇶',
    '🇧🇷',
    '🇧🇸',
    '🇧🇹',
    '🇧🇻',
    '🇧🇼',
    '🇧🇾',
    '🇧🇿',
    '🇨🇦',
    '🇨🇨',
    '🇨🇩',
    '🇨🇫',
    '🇨🇬',
    '🇨🇭',
    '🇨🇮',
    '🇨🇰',
    '🇨🇱',
    '🇨🇲',
    '🇨🇳',
    '🇨🇴',
    '🇨🇵',
    '🇨🇷',
    '🇨🇺',
    '🇨🇻',
    '🇨🇼',
    '🇨🇽',
    '🇨🇾',
    '🇨🇿',
    '🇩🇪',
    '🇩🇬',
    '🇩🇯',
    '🇩🇰',
    '🇩🇲',
    '🇩🇴',
    '🇩🇿',
    '🇪🇦',
    '🇪🇨',
    '🇪🇪',
    '🇪🇬',
    '🇪🇭',
    '🇪🇷',
    '🇪🇸',
    '🇪🇹',
    '🇪🇺',
    '🇫🇮',
    '🇫🇯',
    '🇫🇰',
    '🇫🇲',
    '🇫🇴',
    '🇫🇷',
    '🇬🇦',
    '🇬🇧',
    '🇬🇩',
    '🇬🇪',
    '🇬🇫',
    '🇬🇬',
    '🇬🇭',
    '🇬🇮',
    '🇬🇱',
    '🇬🇲',
    '🇬🇳',
    '🇬🇵',
    '🇬🇶',
    '🇬🇷',
    '🇬🇸',
    '🇬🇹',
    '🇬🇺',
    '🇬🇼',
    '🇬🇾',
    '🇭🇰',
    '🇭🇲',
    '🇭🇳',
    '🇭🇷',
    '🇭🇹',
    '🇭🇺',
    '🇮🇨',
    '🇮🇩',
    '🇮🇪',
    '🇮🇱',
    '🇮🇲',
    '🇮🇳',
    '🇮🇴',
    '🇮🇶',
    '🇮🇷',
    '🇮🇸',
    '🇮🇹',
    '🇯🇪',
    '🇯🇲',
    '🇯🇴',
    '🇯🇵',
    '🇰🇪',
    '🇰🇬',
    '🇰🇭',
    '🇰🇮',
    '🇰🇲',
    '🇰🇳',
    '🇰🇵',
    '🇰🇷',
    '🇰🇼',
    '🇰🇾',
    '🇰🇿',
    '🇱🇦',
    '🇱🇧',
    '🇱🇨',
    '🇱🇮',
    '🇱🇰',
    '🇱🇷',
    '🇱🇸',
    '🇱🇹',
    '🇱🇺',
    '🇱🇻',
    '🇱🇾',
    '🇲🇦',
    '🇲🇨',
    '🇲🇩',
    '🇲🇪',
    '🇲🇫',
    '🇲🇬',
    '🇲🇭',
    '🇲🇰',
    '🇲🇱',
    '🇲🇲',
    '🇲🇳',
    '🇲🇴',
    '🇲🇵',
    '🇲🇶',
    '🇲🇷',
    '🇲🇸',
    '🇲🇹',
    '🇲🇺',
    '🇲🇻',
    '🇲🇼',
    '🇲🇽',
    '🇲🇾',
    '🇲🇿',
    '🇳🇦',
    '🇳🇨',
    '🇳🇪',
    '🇳🇫',
    '🇳🇬',
    '🇳🇮',
    '🇳🇱',
    '🇳🇴',
    '🇳🇵',
    '🇳🇷',
    '🇳🇺',
    '🇳🇿',
    '🇴🇲',
    '🇵🇦',
    '🇵🇪',
    '🇵🇫',
    '🇵🇬',
    '🇵🇭',
    '🇵🇰',
    '🇵🇱',
    '🇵🇲',
    '🇵🇳',
    '🇵🇷',
    '🇵🇸',
    '🇵🇹',
    '🇵🇼',
    '🇵🇾',
    '🇶🇦',
    '🇷🇪',
    '🇷🇴',
    '🇷🇸',
    '🇷🇺',
    '🇷🇼',
    '🇸🇦',
    '🇸🇧',
    '🇸🇨',
    '🇸🇩',
    '🇸🇪',
    '🇸🇬',
    '🇸🇭',
    '🇸🇮',
    '🇸🇯',
    '🇸🇰',
    '🇸🇱',
    '🇸🇲',
    '🇸🇳',
    '🇸🇴',
    '🇸🇷',
    '🇸🇸',
    '🇸🇹',
    '🇸🇻',
    '🇸🇽',
    '🇸🇾',
    '🇸🇿',
    '🇹🇦',
    '🇹🇨',
    '🇹🇩',
    '🇹🇫',
    '🇹🇬',
    '🇹🇭',
    '🇹🇯',
    '🇹🇰',
    '🇹🇱',
    '🇹🇲',
    '🇹🇳',
    '🇹🇴',
    '🇹🇷',
    '🇹🇹',
    '🇹🇻',
    '🇹🇼',
    '🇹🇿',
    '🇺🇦',
    '🇺🇬',
    '🇺🇲',
    '🇺🇳',
    '🇺🇸',
    '🇺🇾',
    '🇺🇿',
    '🇻🇦',
    '🇻🇨',
    '🇻🇪',
    '🇻🇬',
    '🇻🇮',
    '🇻🇳',
    '🇻🇺',
    '🇼🇫',
    '🇼🇸',
    '🇽🇰',
    '🇾🇪',
    '🇾🇹',
    '🇿🇦',
    '🇿🇲',
    '🇿🇼',
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    '🏴󠁧󠁢󠁷󠁬󠁳󠁿'
  ]
)

export function testEmojiSupported (unicode) {
  if (store.get().polyfilledCountryFlagEmoji && COUNTRY_FLAG_EMOJI.has(unicode)) {
    return true // just assume it's supported; isEmojiSupported doesn't work in this case
  }
  return isEmojiSupported(unicode)
}

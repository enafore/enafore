import { sapperInlineScriptChecksums } from '../src/server/sapperInlineScriptChecksums.js'
export async function buildCSP () {
  const SCRIPT_CHECKSUMS = [(await import('../src/inline-script/checksum.js?' + performance.now())).default]
    .concat(sapperInlineScriptChecksums)
    .map((_) => `'sha256-${_}'`)
    .join(' ')
  const policy = [
    "default-src 'self'",
    `script-src 'self' ${SCRIPT_CHECKSUMS}`,
    "worker-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' * data: blob:",
    "media-src 'self' *",
    "connect-src 'self' * data: blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "manifest-src 'self'",
    "form-action 'self'", // we need form-action for the Web Share Target API
    "base-uri 'self'"
  ].join(';')
  return `<meta http-equiv="Content-Security-Policy" content="${policy}" />`
}

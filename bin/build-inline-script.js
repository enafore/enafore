import crypto from 'crypto'
import fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import { cpus } from 'os'
import { rollup } from 'rollup'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import terserOptions from './terserOptions.js'
import { inlineThemeColors } from '../webpack/shared.config.js'
import { sapperInlineScriptChecksums } from '../src/server/sapperInlineScriptChecksums.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const writeFile = promisify(fs.writeFile)

async function buildInlineScriptAndCSP () {
  const inlineScriptPath = path.join(__dirname, '../src/inline-script/inline-script.js')

  const bundle = await rollup({
    input: inlineScriptPath,
    plugins: [
      replace({
        values: {
          'process.env.BROWSER': 'true',
          'process.env.THEME_COLORS': JSON.stringify(inlineThemeColors)
        },
        preventAssignment: false
      }),
      // TODO: can't disable terser at all, it causes the CSP checksum to stop working
      // because the HTML gets minified as some point so the checksums don't match.
      terser(Object.defineProperties({ ...terserOptions, mangle: !process.env.DEBUG }, {
        maxWorkers: {
          value: cpus().length || 1,
          enumerable: false
        }
      }))
    ]
  })
  const { output } = await bundle.generate({
    format: 'iife',
    sourcemap: 'hidden'
  })

  const { code, map } = output[0]

  const fullCode = `${code}//# sourceMappingURL=/inline-script.js.map`
  const SCRIPT_CHECKSUMS = [crypto.createHash('sha256').update(fullCode, 'utf8').digest('base64'), ...sapperInlineScriptChecksums]
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
  await writeFile(path.resolve(__dirname, '../static/inline-script.js.map'),
    map.toString(), 'utf8')
  return {
    inlineScript: `<script>${fullCode}</script>`,
    csp: `<meta http-equiv="Content-Security-Policy" content="${policy}" />`
  }
}

export function buildInlineScript (context) {
  if (context.inlineScript) {
    return context.inlineScript
  } else {
    const promise = buildInlineScriptAndCSP()
    context.inlineScript = promise.then(e => e.inlineScript)
    return promise.then(e => e.csp)
  }
}

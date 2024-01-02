import * as sass from 'sass'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { minify } from 'csso';

const writeFile = promisify(fs.writeFile)
const readdir = promisify(fs.readdir)
const __dirname = path.dirname(new URL(import.meta.url).pathname)

const globalScss = path.join(__dirname, '../src/scss/global.scss')
const customScrollbarScss = path.join(__dirname, '../src/scss/custom-scrollbars.scss')
const themesScssDir = path.join(__dirname, '../src/scss/themes')
const assetsDir = path.join(__dirname, '../static')

async function renderCss (file) {
  const result = await sass.compile(file, { outputStyle: 'compressed' })
  if (process.env.NODE_ENV === 'production') {
    return minify(result.css).css
  }
  return result.css
}

async function compileGlobalSass () {
  const mainStyle = (await Promise.all([globalScss].map(renderCss))).join('')
  const scrollbarStyle = (await renderCss(customScrollbarScss))

  return `<style>\n${mainStyle}</style>\n` +
    `<style media="all" id="theScrollbarStyle">\n${scrollbarStyle}</style>\n`
}

async function compileThemesSass () {
  const files = (await readdir(themesScssDir)).filter(file => !path.basename(file).startsWith('_') && !path.basename(file).startsWith('.'))
  await Promise.all(files.map(async file => {
    let css = await renderCss(path.join(themesScssDir, file))
    const outputFilename = 'theme-' + path.basename(file).replace(/\.scss$/, '.css')
    await writeFile(path.join(assetsDir, outputFilename), css, 'utf8')
    if (outputFilename === 'theme-default.css') {
      await writeFile(path.join(assetsDir, 'theme-sw.css'), css, 'utf8')
    }
  }))
}

export async function buildSass () {
  const [result] = await Promise.all([compileGlobalSass(), compileThemesSass()])
  return result
}

import getGoogleTranslateHTML from './googleTranslateHTML.js'
/*

to regenerate, run this on https://simplytranslate.org/?engine=google

```js
const source = [...document.querySelector('[name=from]').options].map(e=>[e.value, e.textContent])
const target = [...document.querySelector('[name=to]').options].map(e=>[e.value, e.textContent])
console.log(`const sharedLanguageNames = ${JSON.stringify(Object.fromEntries(source.filter(e=>target.find(a=>a.join()===e.join()))), null, 2)};
export const sourceLanguageNames = {
  ...sharedLanguageNames,
${JSON.stringify(Object.fromEntries(source.filter(e=>!target.find(a=>a.join()===e.join()))), null, 2).slice(2)}
export const targetLanguageNames = {
  ...sharedLanguageNames,
${JSON.stringify(Object.fromEntries(target.filter(e=>!source.find(a=>a.join()===e.join()))), null, 2).slice(2)}`)
```

*/
const sharedLanguageNames = {
  af: 'Afrikaans',
  sq: 'Albanian',
  am: 'Amharic',
  ar: 'Arabic',
  hy: 'Armenian',
  as: 'Assamese',
  ay: 'Aymara',
  az: 'Azerbaijani',
  bm: 'Bambara',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali',
  bho: 'Bhojpuri',
  bs: 'Bosnian',
  bg: 'Bulgarian',
  ca: 'Catalan',
  ceb: 'Cebuano',
  ny: 'Chichewa',
  co: 'Corsican',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  dv: 'Dhivehi',
  doi: 'Dogri',
  nl: 'Dutch',
  en: 'English',
  eo: 'Esperanto',
  et: 'Estonian',
  ee: 'Ewe',
  tl: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  fy: 'Frisian',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gn: 'Guarani',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  ha: 'Hausa',
  haw: 'Hawaiian',
  iw: 'Hebrew',
  hi: 'Hindi',
  hmn: 'Hmong',
  hu: 'Hungarian',
  is: 'Icelandic',
  ig: 'Igbo',
  ilo: 'Ilocano',
  id: 'Indonesian',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  jw: 'Javanese',
  kn: 'Kannada',
  kk: 'Kazakh',
  km: 'Khmer',
  rw: 'Kinyarwanda',
  gom: 'Konkani',
  ko: 'Korean',
  kri: 'Krio',
  ku: 'Kurdish (Kurmanji)',
  ckb: 'Kurdish (Sorani)',
  ky: 'Kyrgyz',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  ln: 'Lingala',
  lt: 'Lithuanian',
  lg: 'Luganda',
  lb: 'Luxembourgish',
  mk: 'Macedonian',
  mai: 'Maithili',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  mi: 'Maori',
  mr: 'Marathi',
  'mni-Mtei': 'Meiteilon (Manipuri)',
  lus: 'Mizo',
  mn: 'Mongolian',
  my: 'Myanmar (Burmese)',
  ne: 'Nepali',
  no: 'Norwegian',
  or: 'Odia (Oriya)',
  om: 'Oromo',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  pa: 'Punjabi',
  qu: 'Quechua',
  ro: 'Romanian',
  ru: 'Russian',
  sm: 'Samoan',
  sa: 'Sanskrit',
  gd: 'Scots Gaelic',
  nso: 'Sepedi',
  sr: 'Serbian',
  st: 'Sesotho',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish',
  su: 'Sundanese',
  sw: 'Swahili',
  sv: 'Swedish',
  tg: 'Tajik',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  ti: 'Tigrinya',
  ts: 'Tsonga',
  tr: 'Turkish',
  tk: 'Turkmen',
  ak: 'Twi',
  uk: 'Ukrainian',
  ur: 'Urdu',
  ug: 'Uyghur',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  cy: 'Welsh',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zu: 'Zulu'
}
export const sourceLanguageNames = {
  ...sharedLanguageNames,
  auto: 'Detect language',
  'zh-CN': 'Chinese'
}
export const targetLanguageNames = {
  ...sharedLanguageNames,
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)'
}
export const translate = getGoogleTranslateHTML(async function translate (text, to, from) {
  const data = await (await fetch('https://simplytranslate.org/api/translate?' + new URLSearchParams({
    text,
    from,
    to,
    engine: 'google'
  }))).json()
  return {
    detected: data.source_language,
    text: data.translated_text,
    to,
    from
  }
})

// Auto-translate non-English posts
async function handlePost(post) {
  const defaultLanguage = 'en'; // Set default language to English
  let translatedPost = post;

  // Detect the language of the post
  const detectedLanguage = await detectLanguage(post.content);

  // If the detected language is not English, translate the post
  if (detectedLanguage !== defaultLanguage) {
    const translation = await translate(post.content, defaultLanguage, detectedLanguage);
    translatedPost = {
      ...post,
      content: translation.text,
      originalContent: post.content,
      originalLanguage: detectedLanguage,
      translated: true
    };
  }

  // Process the post (e.g., display it)
  displayPost(translatedPost);
}

async function detectLanguage(text) {
  const response = await fetch('https://simplytranslate.org/api/detect?' + new URLSearchParams({
    text,
    engine: 'google'
  }));
  const data = await response.json();
  return data.language;
}

function displayPost(post) {
  // Logic to display the post
  console.log(post);
  // Your code to handle displaying the post goes here
}

// Example post
const post = {
  content: "Hola, ¿cómo estás?"
};

handlePost(post);

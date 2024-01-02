export const importKatex = () =>
  Promise.all([
    import(/* webpackChunkName: '$katex$' */ 'katex'),
    import(/* webpackChunkName: '$katex$' */ 'katex/dist/katex.min.css')
  ]).then(e => e[0].default)

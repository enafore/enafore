import { minify } from 'csso'
export default function(source) {
    return minify(source.replace(/\/\*# sourceMappingURL=.+?\*\//g, "")).css
}
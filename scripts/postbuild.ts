// vite-ssg with dirStyle 'nested' writes /404 to dist/404/index.html.
// Static hosts (Vercel) serve dist/404.html for unknown paths, so copy it there.
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const from = resolve(import.meta.dirname, '../dist/404/index.html')
const to = resolve(import.meta.dirname, '../dist/404.html')

if (!existsSync(from)) {
  console.error(`postbuild: ${from} is missing. Is '/404' in includedRoutes?`)
  process.exit(1)
}
copyFileSync(from, to)
console.log('postbuild: wrote dist/404.html')

// Scans every committed text file and the build output for personal data.
// Usage: npm run privacy   (exit code 1 if anything is found)
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { findViolations } from './privacy'

const root = resolve(import.meta.dirname, '..')
const TEXT = /\.(ts|js|mjs|vue|css|html|json|md|svg|txt|xml|webmanifest)$/

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean)
  .map((f) => join(root, f))
const files = [...tracked, ...walk(join(root, 'dist'))].filter((f) => TEXT.test(f))

let failures = 0
for (const file of files) {
  for (const v of findViolations(readFileSync(file, 'utf8'))) {
    failures++
    console.error(`${relative(root, file)}: ${v.rule} → ${v.match}`)
  }
}

if (failures) {
  console.error(`privacy-check: ${failures} problem(s) found`)
  process.exit(1)
}
console.log(`privacy-check: ${files.length} files clean`)

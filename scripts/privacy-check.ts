// Scans the repo's text files and the build output for personal data.
// Runs at the end of `npm run build`, so a leak fails the Vercel deploy too.
// Usage: npm run privacy   (exit code 1 if anything is found)
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { findViolations } from './privacy'

const root = resolve(import.meta.dirname, '..')
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.work', '.superpowers', 'test-results', 'playwright-report'])

function walk(dir: string, skip: Set<string> = new Set()): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return skip.has(name) ? [] : walk(p, skip)
    return [p]
  })
}

// Committed + untracked-but-not-ignored files. Without git (some CI build images), walk the tree.
function repoFiles(): string[] {
  try {
    return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .filter(Boolean)
      .map((f) => join(root, f))
  } catch {
    return walk(root, SKIP_DIRS)
  }
}

const files = [...repoFiles(), ...walk(join(root, 'dist'))].filter((f) => existsSync(f)) // skip deleted-but-unstaged

let scanned = 0
let failures = 0
for (const file of files) {
  const buf = readFileSync(file)
  if (buf.includes(0)) continue // binary (images, fonts): text scanning cannot see inside them
  scanned++
  for (const v of findViolations(buf.toString('utf8'))) {
    failures++
    console.error(`${relative(root, file)}: ${v.rule} → ${v.match}`)
  }
}

if (failures) {
  console.error(`privacy-check: ${failures} problem(s) found`)
  process.exit(1)
}
console.log(`privacy-check: ${scanned} text files clean`)

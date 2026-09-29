// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const file = resolve(import.meta.dirname, '../../.github/workflows/ci.yml')
const yml = () => readFileSync(file, 'utf8')

describe('CI workflow', () => {
  it('exists', () => {
    expect(existsSync(file)).toBe(true)
  })
  it('runs on pull requests and on pushes to main', () => {
    expect(yml()).toMatch(/on:\s*\n\s+pull_request:/)
    expect(yml()).toMatch(/push:\s*\n\s+branches:\s*\[main\]/)
  })
  it('has read-only permissions and no secrets', () => {
    expect(yml()).toMatch(/permissions:\s*\n\s+contents: read/)
    expect(yml()).not.toMatch(/secrets\./)
  })
  it('names the job "check", which branch protection and Vercel refer to', () => {
    expect(yml()).toMatch(/jobs:\s*\n\s+check:/)
  })
  it('cancels an older run on the same ref', () => {
    expect(yml()).toMatch(/concurrency:[\s\S]*cancel-in-progress: true/)
  })
  it('installs exactly the lockfile, takes Node from .nvmrc, and runs the full check', () => {
    expect(yml()).toContain('node-version-file: .nvmrc')
    expect(yml()).toContain('run: npm ci')
    expect(yml()).toContain('npx playwright install --with-deps chromium')
    expect(yml()).toContain('run: npm run check')
  })
  it('uploads the Playwright report when the job fails', () => {
    expect(yml()).toMatch(/if: failure\(\)[\s\S]*actions\/upload-artifact@v7[\s\S]*path: playwright-report/)
  })
})

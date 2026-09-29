// @vitest-environment node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { projects } from '../../src/content/projects'
import { site } from '../../src/content/site'
import { CATEGORY_ORDER } from '../../src/content/queries'

const publicDir = resolve(import.meta.dirname, '../../public')

describe('projects content', () => {
  it('has 11 projects', () => {
    expect(projects).toHaveLength(11)
  })
  it('uses unique kebab-case slugs', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })
  it('gives every project a valid category, text, tools, and at least one contribution', () => {
    for (const p of projects) {
      expect(CATEGORY_ORDER).toContain(p.category)
      expect(p.title.trim()).not.toBe('')
      expect(p.summary.trim()).not.toBe('')
      expect(p.overview.trim()).not.toBe('')
      expect(p.tools.length).toBeGreaterThan(0)
      expect(p.contributions.length).toBeGreaterThan(0)
    }
  })
  it('features exactly the 3 agreed projects', () => {
    expect(projects.filter((p) => p.featured).map((p) => p.slug)).toEqual([
      'google-ads-dashboard',
      'ai-acceptance-research',
      'snapcash-pos',
    ])
  })
  it('only links over https', () => {
    for (const p of projects) for (const l of p.links ?? []) expect(l.href).toMatch(/^https:\/\//)
  })
  it('points every image at a file that exists, with alt text and a size', () => {
    for (const p of projects)
      for (const img of p.images) {
        expect(existsSync(resolve(publicDir, `.${img.src}`)), img.src).toBe(true)
        expect(img.alt.trim()).not.toBe('')
        expect(img.width).toBeGreaterThan(0)
        expect(img.height).toBeGreaterThan(0)
      }
  })
  it('keeps content rules from the spec', () => {
    const text = JSON.stringify(projects)
    expect(text).not.toMatch(/power query/i)
    expect(text).not.toMatch(/selenium|postman/i)
    expect(text).not.toMatch(/LT-001/)
  })
})

describe('site content', () => {
  it('derives the project count from the project list', () => {
    expect(site.stats[0]).toEqual({ value: projects.length, label: 'projects' })
  })
})

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { projects } from '../../src/content/projects'

const dist = resolve(import.meta.dirname, '../../dist')
const read = (p: string) => readFileSync(resolve(dist, p), 'utf8')
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ogTitle = (html: string) => html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/)?.[1]

describe('dist', () => {
  it('pre-renders the home page with real content and final stat numbers', () => {
    const html = read('index.html')
    expect(html).toMatch(/<title>Meini Rusiadi — Data (&amp;|&) BI Analyst<\/title>/)
    expect(html).toContain('clear decisions')
    expect(html).toContain('2,125')
    expect(html).toContain(`>${projects.length}<`)
  })

  it.each(projects.map((p) => [p.slug, p] as const))(
    'pre-renders /projects/%s with its own title and og:title',
    (slug, p) => {
      const file = `projects/${slug}/index.html`
      expect(existsSync(resolve(dist, file))).toBe(true)
      const html = read(file)
      expect(html).toContain(`<title>${escape(p.title)} · Meini Rusiadi</title>`)
      expect(ogTitle(html)).toBe(escape(`${p.title} · Meini Rusiadi`))
      expect(html).toContain(escape(p.contributions[0]!))
    },
  )

  it('gives every page a unique og:title', () => {
    const titles = ['index.html', ...projects.map((p) => `projects/${p.slug}/index.html`)].map((f) =>
      ogTitle(read(f)),
    )
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('writes a 404.html for the static host', () => {
    expect(read('404.html')).toContain('This page does not exist')
  })
})

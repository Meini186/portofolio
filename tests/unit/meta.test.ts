import { describe, expect, it } from 'vitest'
import { canonical, pageMeta } from '../../src/content/meta'

describe('pageMeta', () => {
  it('builds absolute og:url and og:image from the site origin', () => {
    const meta = pageMeta({ title: 'T', description: 'D', path: '/projects/x', image: '/og/x.png' })
    const get = (key: string) => meta.find((m) => m.property === key || m.name === key)?.content
    expect(get('og:title')).toBe('T')
    expect(get('description')).toBe('D')
    expect(get('og:url')).toBe('http://localhost:4173/projects/x')
    expect(get('og:image')).toBe('http://localhost:4173/og/x.png')
    expect(get('twitter:card')).toBe('summary_large_image')
  })
  it('builds canonical URLs', () => {
    expect(canonical('/')).toBe('http://localhost:4173/')
  })
})

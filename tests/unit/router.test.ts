import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '../../src/router'

const router = createRouter({ history: createMemoryHistory(), routes })

describe('routes', () => {
  it('resolves the home page', () => {
    expect(router.resolve('/').name).toBe('home')
  })
  it('resolves a project page and passes the slug', () => {
    const r = router.resolve('/projects/google-ads-dashboard')
    expect(r.name).toBe('project')
    expect(r.params.slug).toBe('google-ads-dashboard')
  })
  it('resolves a project page with a trailing slash', () => {
    expect(router.resolve('/projects/snapcash-pos/').name).toBe('project')
  })
  it('sends unknown paths to not-found', () => {
    expect(router.resolve('/nope/at/all').name).toBe('not-found')
  })
})

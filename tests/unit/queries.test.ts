import { describe, expect, it } from 'vitest'
import type { Project } from '../../src/content/types'
import {
  countByFilter,
  featuredProjects,
  filterProjects,
  getProject,
  hasContact,
  neighbours,
} from '../../src/content/queries'

const make = (slug: string, category: Project['category'], featured = false): Project => ({
  slug,
  title: slug,
  category,
  featured,
  course: 'c',
  team: 'Individual',
  tools: ['t'],
  summary: 's',
  overview: 'o',
  contributions: ['x'],
  images: [],
})

const list = [make('a', 'data-bi', true), make('b', 'qa'), make('c', 'data-bi')]

describe('queries', () => {
  it('filterProjects returns everything for "all"', () => {
    expect(filterProjects(list, 'all').map((p) => p.slug)).toEqual(['a', 'b', 'c'])
  })
  it('filterProjects keeps order within a category', () => {
    expect(filterProjects(list, 'data-bi').map((p) => p.slug)).toEqual(['a', 'c'])
  })
  it('countByFilter counts every filter, including empty ones', () => {
    expect(countByFilter(list)).toEqual({ all: 3, 'data-bi': 2, database: 0, qa: 1, 'systems-pm': 0, ux: 0 })
  })
  it('getProject finds by slug and returns undefined for unknown', () => {
    expect(getProject('b', list)?.slug).toBe('b')
    expect(getProject('zzz', list)).toBeUndefined()
  })
  it('neighbours has no prev on the first and no next on the last', () => {
    expect(neighbours('a', list)).toEqual({ prev: undefined, next: list[1] })
    expect(neighbours('c', list)).toEqual({ prev: list[1], next: undefined })
    expect(neighbours('zzz', list)).toEqual({})
  })
  it('featuredProjects keeps only featured', () => {
    expect(featuredProjects(list).map((p) => p.slug)).toEqual(['a'])
  })
  it('hasContact is false when every field is empty', () => {
    expect(hasContact({})).toBe(false)
    expect(hasContact({ email: '' })).toBe(false)
    expect(hasContact({ linkedin: 'https://linkedin.com/in/x' })).toBe(true)
  })
})

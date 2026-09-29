import type { Category, Contact, Project } from './types'
import { projects as allProjects } from './projects'

export type Filter = Category | 'all'

export const CATEGORY_LABELS: Record<Category, string> = {
  'data-bi': 'Data & BI',
  database: 'Database',
  qa: 'QA',
  'systems-pm': 'Systems & PM',
  ux: 'UX',
}

export const CATEGORY_ORDER: Category[] = ['data-bi', 'database', 'qa', 'systems-pm', 'ux']

export function filterProjects(list: Project[], filter: Filter): Project[] {
  return filter === 'all' ? list : list.filter((p) => p.category === filter)
}

export function countByFilter(list: Project[]): Record<Filter, number> {
  const counts = { all: list.length } as Record<Filter, number>
  for (const c of CATEGORY_ORDER) counts[c] = list.filter((p) => p.category === c).length
  return counts
}

export function getProject(slug: string, list: Project[] = allProjects): Project | undefined {
  return list.find((p) => p.slug === slug)
}

export function neighbours(
  slug: string,
  list: Project[] = allProjects,
): { prev?: Project; next?: Project } {
  const i = list.findIndex((p) => p.slug === slug)
  if (i < 0) return {}
  return { prev: list[i - 1], next: list[i + 1] }
}

export function featuredProjects(list: Project[] = allProjects): Project[] {
  return list.filter((p) => p.featured)
}

export function hasContact(c: Contact): boolean {
  return Boolean(c.email || c.linkedin || c.github)
}

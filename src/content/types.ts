export type Category = 'data-bi' | 'database' | 'qa' | 'systems-pm' | 'ux'

export interface ProjectImage {
  src: string // public path, e.g. /projects/google-ads-dashboard/01.webp
  alt: string
  caption?: string
  width: number
  height: number
}

export interface Stat {
  value: number
  label: string
}

export interface ExternalLink {
  label: string
  href: string
}

export interface Project {
  slug: string
  title: string
  category: Category
  featured?: boolean
  course: string
  term?: string
  team: string
  role?: string
  tools: string[]
  summary: string
  overview: string
  contributions: string[]
  stats?: Stat[]
  links?: ExternalLink[]
  images: ProjectImage[]
}

export interface Certificate {
  name: string
  issuer: string
  date: string
}

export interface SkillGroup {
  group: string
  items: string[]
}

export interface Contact {
  email?: string
  linkedin?: string
  github?: string
}

export interface Site {
  name: string
  shortName: string
  roles: string[]
  headline: { lead: string; highlight: string }
  intro: string
  cvUrl?: string
  contact: Contact
  stats: Stat[]
  skills: SkillGroup[]
  certificates: Certificate[]
}

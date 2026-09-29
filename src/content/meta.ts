import { siteUrl } from './env'

export interface MetaInput {
  title: string
  description: string
  path: string
  image: string
}

export function canonical(path: string): string {
  return `${siteUrl}${path}`
}

export function pageMeta({ title, description, path, image }: MetaInput) {
  return [
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical(path) },
    { property: 'og:image', content: `${siteUrl}${image}` },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
}

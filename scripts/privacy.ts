export interface Violation {
  rule: string
  match: string
}

const RULES: Array<{ rule: string; pattern: RegExp }> = [
  { rule: 'student-id', pattern: /\b28\d{8}\b/g },
  { rule: 'campus-email', pattern: /[\w.+-]+@binus\.ac\.id/gi },
  { rule: 'canva-edit', pattern: /canva\.com\/design\/\S+?\/edit/gi },
]

export function findViolations(text: string): Violation[] {
  const found: Violation[] = []
  for (const { rule, pattern } of RULES)
    for (const m of text.matchAll(pattern)) found.push({ rule, match: m[0] })
  return found
}

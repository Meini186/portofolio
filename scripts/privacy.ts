export interface Violation {
  rule: string
  match: string
}

const RULES: Array<{ rule: string; pattern: RegExp }> = [
  // Digit boundaries, not \b: `_` and letters are word characters, so \b would miss
  // IDs inside file names or slugs such as Report_28xxxxxxxx.
  { rule: 'student-id', pattern: /(?<!\d)28\d{8}(?!\d)/g },
  { rule: 'campus-email', pattern: /[\w.+-]+@binus\.ac\.id/gi },
  { rule: 'canva-edit', pattern: /canva\.com\/design\/\S+?\/edit/gi },
]

export function findViolations(text: string): Violation[] {
  const found: Violation[] = []
  for (const { rule, pattern } of RULES)
    for (const m of text.matchAll(pattern)) found.push({ rule, match: m[0] })
  return found
}

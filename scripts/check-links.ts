// GETs every external link in the content and reports its HTTP status. Read-only.
import { projects } from '../src/content/projects'

let broken = 0
for (const p of projects)
  for (const l of p.links ?? []) {
    try {
      const res = await fetch(l.href, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 link-check' } })
      const ok = res.status < 400
      if (!ok) broken++
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${res.status} ${p.slug} → ${l.href}`)
    } catch (err) {
      broken++
      console.log(`FAIL ERR ${p.slug} → ${l.href} (${(err as Error).message})`)
    }
  }
if (broken) {
  console.error(`check-links: ${broken} broken`)
  process.exit(1)
}

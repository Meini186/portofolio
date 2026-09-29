// Writes 1200×630 Open Graph cards in the Soft Lavender style to public/og/.
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'
import { projects } from '../src/content/projects'
import { CATEGORY_LABELS } from '../src/content/queries'

const out = resolve(import.meta.dirname, '../public/og')
mkdirSync(out, { recursive: true })

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function wrap(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line.trim())
      line = word
    } else line += ' ' + word
  }
  if (line.trim()) lines.push(line.trim())
  return lines.slice(0, 3)
}

function card(eyebrow: string, title: string, footer: string): string {
  const lines = wrap(title, 26)
  const tspans = lines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 76}">${esc(l)}</tspan>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8ff"/><stop offset="1" stop-color="#f5eefc"/></linearGradient>
    <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="60"/></filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="80" r="200" fill="#e9d5ff" filter="url(#blur)"/>
  <circle cx="560" cy="640" r="160" fill="#fbcfe8" filter="url(#blur)"/>
  <text x="80" y="110" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#1e1530">meini.</text>
  <text x="80" y="230" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3" fill="#9333ea">${esc(eyebrow.toUpperCase())}</text>
  <text x="80" y="320" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#1e1530">${tspans}</text>
  <text x="80" y="560" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#6b5a80">${esc(footer)}</text>
</svg>`
}

await sharp(Buffer.from(card('Data & BI Analyst · QA · Database', 'Turning messy data into clear decisions', 'Meini Rusiadi')))
  .png()
  .toFile(join(out, 'home.png'))

for (const p of projects) {
  await sharp(Buffer.from(card(CATEGORY_LABELS[p.category], p.title, `Meini Rusiadi · ${p.team}`)))
    .png()
    .toFile(join(out, `${p.slug}.png`))
}
console.log(`make-og: ${projects.length + 1} cards`)

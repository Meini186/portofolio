// Copies images out of the source documents into .work/extracted/<slug>/ (gitignored).
// Sources are matched by folder + pattern, never by full file name, because some
// file names contain classmates' names. The source folders are only read.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SOURCE_ROOT = resolve(import.meta.dirname, '../..')
const OUT = resolve(import.meta.dirname, '../.work/extracted')

const SOURCES: Array<{ slug: string; folder: string; match: RegExp }> = [
  { slug: 'google-ads-dashboard', folder: 'Data Visualization', match: /\.pdf$/i },
  { slug: 'ai-acceptance-research', folder: 'Research Method', match: /\.docx$/i },
  { slug: 'budgetwise-finance-dashboard', folder: 'Data Modelling', match: /\.pdf$/i },
  { slug: 'ecommerce-order-analysis', folder: 'Data Modelling', match: /LAB.*\.docx$/i },
  { slug: 'shoe-factory-database', folder: 'Database Fundamental', match: /PABRIK.*\.docx$/i },
  { slug: 'soundease-database', folder: 'Database Fundamental', match: /LAB.*\.docx$/i },
  { slug: 'livetix-testing', folder: 'Testing & Systems Implementation', match: /\.docx$/i },
  { slug: 'snapcash-pos', folder: 'IS Project Management', match: /\.pdf$/i },
  { slug: 'stsport-booking-system', folder: 'ISAD', match: /\.docx$/i },
  { slug: 'tix-id-redesign', folder: 'UXRD', match: /LC11\.docx$/i },
  { slug: 'edupal-ai-teacher', folder: 'Foundations of AI', match: /\.docx$/i },
]

rmSync(OUT, { recursive: true, force: true })
for (const { slug, folder, match } of SOURCES) {
  const dir = join(SOURCE_ROOT, folder)
  const files = readdirSync(dir).filter((f) => match.test(f))
  if (files.length !== 1) throw new Error(`${slug}: expected 1 match in "${folder}", found ${files.length}`)
  const src = join(dir, files[0]!)
  const out = join(OUT, slug)
  mkdirSync(out, { recursive: true })
  if (src.toLowerCase().endsWith('.pdf')) {
    execFileSync('swift', [resolve(import.meta.dirname, 'pdf-to-png.swift'), src, out])
  } else {
    // -j: flatten paths, -o: overwrite, -q: quiet. Only word/media/* is extracted.
    try {
      execFileSync('unzip', ['-j', '-o', '-q', src, 'word/media/*', '-d', out], { stdio: 'pipe' })
    } catch (err) {
      // Exit code 11 means "no matching files": the document has no embedded images.
      if ((err as { status?: number }).status !== 11) throw err
    }
  }
  console.log(`${slug}: ${readdirSync(out).length} files`)
}

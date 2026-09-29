# Meini Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, pre-rendered Vue 3 portfolio site for Meini Rusiadi. It has a home page, 11 project detail pages, a 404 page, the "Soft Lavender" style, and "Interactive" motion.

**Architecture:** Vite + Vue 3 SFCs. `vite-ssg` pre-renders every route to its own HTML file, so each project URL has its own `<title>` and Open Graph tags. All content lives in plain TypeScript data files under `src/content/`, and only the page components read them. Motion is a set of small composables. They act only after mount and only when the user allows motion, so the SSR HTML is always the complete, final content.

**Tech Stack:** Node 22, npm, Vite 8, Vue 3.5, vue-router 4.6, vite-ssg 28, @unhead/vue 2, TypeScript 5.9, Tailwind CSS 4, Vitest 5, @vue/test-utils, jsdom, Playwright, sharp (dev only), ESLint 10, Prettier.

**Spec:** `docs/superpowers/specs/2026-09-29-meini-portfolio-design.md`

## Deviations from the spec (decided while planning)

| Spec says | Plan does | Why |
|---|---|---|
| `@vueuse/core` for motion | No VueUse. `src/composables/motion.ts` reads `matchMedia` directly inside `onMounted` / event handlers | VueUse's `useMediaQuery` fills its value after its own mount hook, so a reduced-motion check inside our `onMounted` can see a stale `false`. Reading `matchMedia` directly is deterministic, and it is one fewer dependency |
| `tailwind.config.ts` | Tailwind 4 `@theme` block in `src/styles.css` | Tailwind 4 has no JS config file. Tokens are CSS variables by design |
| `term: string` | `term?: string` | §13 says missing terms are hidden. Four projects have no known term |
| Detail page is one component | `ProjectPage.vue` (resolves the route) + `ProjectDetail.vue` (renders a `Project`) | This lets tests render a project with no images, links, or stats without touching the real content |
| Image `width`/`height` written by hand | Generated into `src/content/images.generated.ts` by the optimize script | Correct sizes prevent layout shift, and a script cannot mistype them |
| "latest" versions | vue-router `^4.6.4`, TypeScript `~5.9.3` | vue-router 5 and TypeScript 7 (the native compiler) are new majors, and `vue-tsc` support for TS 7 is unproven. 4.6 and 5.9 are the stable lines |

## Global Constraints

- The project lives in `/Users/karvin/meini/portfolio-web/`. All commands run from there unless a step says otherwise.
- Git identity is repo-local: `karvinnd1207@gmail.com`. Never commit with the Arthanexa email. Check with `git config user.email` before the first commit.
- Work on branch `feat/portfolio-site`. Never commit directly to `main`.
- Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`). Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- The site is English only.
- **Never publish:** student IDs (`\b28\d{8}\b`), `@binus.ac.id` emails, classmates' names, certificate PDFs, or the Canva `/edit` link.
- Source file names in `/Users/karvin/meini/` can contain classmates' names. Scripts refer to source files by **folder + pattern**, never by full file name. No committed file may contain a classmate's name.
- The source folders in `/Users/karvin/meini/` are read-only. Nothing may write there except `portfolio-web/`.
- Colour tokens are exact: `bg #fbf8ff`, `bg-2 #f5eefc`, `surface #ffffff`, `ink #1e1530`, `muted #6b5a80`, `primary #6d28d9`, `primary-ink #6b21a8`, `primary-soft #ede4fb`, `accent #ec4899`, `line #eadcfb`. `accent` is never used for small text.
- Motion limits: reveal 14 px / 0.6 s / 80 ms stagger / once. Tilt max 8° (fine pointer only). Count-up 1.2 s ease-out cubic. Magnetic max 6 px (fine pointer only). Route fade 200 ms. Everything is off when `prefers-reduced-motion: reduce` is set.
- Breakpoints are 640 px (`sm`) and 1024 px (`lg`). The side gutter on phones is 16 px (`px-4`). The page never scrolls horizontally.
- Content rules (spec §5):
  - Claim only Meini's listed parts.
  - No "Power Query" for BudgetWise.
  - No Selenium or Postman for LiveTix.
  - No LT-001 bug report.
  - No BudgetWise insights.
  - LiveTix says "designed 17 test cases".
- Held-back material (spec §6): the Shoe Factory ERD image, SoundEase query 10, and the Shoe Factory MongoDB snippet.
- `VITE_SITE_URL` sets the absolute origin for OG tags. The fallback is `http://localhost:4173`.

## Review Focus

These are the input classes most likely to break for a real visitor. The spec implies them, but no feature test would catch them by accident:

1. **Direct load or refresh of `/projects/<slug>` and `/projects/<slug>/`** (trailing slash, typical when a link is pasted) must render the project with no hydration error. The test is in Task 9: the e2e "detail page loads directly" test.
2. **A project with no images, no links, and no stats** (for example, if Meini removes all screenshots from one project) must render with no empty "Gallery" or "Key numbers" headings. The test is in Task 5: the `ProjectDetail` minimal-project test.
3. **A 360 px wide phone** must never scroll the page sideways, even with long titles and many tool chips. The test is in Task 9: the e2e overflow test.
4. **SSR/client mismatch from motion.** If count-up or reveal changes the markup before hydration, the page logs hydration errors and flickers. The tests are in Task 6 (the SSR HTML contains the final stat numbers) and Task 9 (zero console errors on home and detail pages).
5. **A keyboard-only visitor using the lightbox** must be able to open it with Enter, move with the arrow keys, close it with Esc, and land back on the image they started from. The tests are in Task 5 (unit: focus returns to the opener) and Task 9 (e2e with the real browser dialog).

---

## File map

```
portfolio-web/
  .nvmrc  .env.example  .prettierrc.json  eslint.config.js
  package.json  tsconfig.json  vite.config.ts  vitest.config.ts  vitest.build.config.ts  playwright.config.ts
  index.html
  public/favicon.svg
  public/og/*.png                         Task 7 (generated)
  public/projects/<slug>/*.webp           Task 7 (generated)
  scripts/
    privacy.ts            findViolations() — pure
    privacy-check.ts      CLI: scan repo text files + dist/
    postbuild.ts          copy dist/404/index.html → dist/404.html
    extract-images.ts     source docs → .work/extracted/<slug>/
    pdf-to-png.swift      render PDF pages to PNG (macOS PDFKit)
    image-manifest.json   curated list: which extracted image → which slug, alt, crop
    optimize-images.ts    manifest → public/projects/**.webp + src/content/images.generated.ts
    make-og.ts            public/og/<slug>.png + home.png
    check-links.ts        GET every external link, report status
  src/
    main.ts  App.vue  router.ts  styles.css  env.d.ts
    content/
      types.ts            all content types
      env.ts              siteUrl
      images.generated.ts projectImages (generated; starts empty)
      projects.ts         projects: Project[]
      site.ts             site: Site
      queries.ts          CATEGORY_LABELS, CATEGORY_ORDER, filterProjects, countByFilter, getProject, neighbours, featuredProjects, hasContact
      meta.ts             pageMeta()
    composables/
      motion.ts           motionAllowed(), finePointer()
      useReveal.ts  useTilt.ts  useCountUp.ts  useMagnetic.ts
    components/
      AppNav.vue  AppFooter.vue  RevealItem.vue
      HeroSection.vue  StatNumber.vue  StatsStrip.vue
      ProjectCard.vue  ProjectFilter.vue
      SkillsSection.vue  CertificatesSection.vue  ContactSection.vue
      ProjectDetail.vue  ScreenshotGallery.vue  ImageLightbox.vue  ProjectNav.vue
    pages/
      HomePage.vue  ProjectPage.vue  NotFoundPage.vue
  tests/
    setup.ts
    unit/*.test.ts
    build/dist.test.ts
    e2e/site.spec.ts
```

---

### Task 1: Scaffold, tooling, router

**Files:**
- Create: `package.json`, `.nvmrc`, `.env.example`, `.prettierrc.json`, `eslint.config.js`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `public/favicon.svg`, `src/env.d.ts`, `src/main.ts`, `src/App.vue`, `src/router.ts`, `src/styles.css`, `src/pages/HomePage.vue`, `src/pages/ProjectPage.vue`, `src/pages/NotFoundPage.vue`, `tests/setup.ts`
- Modify: `.gitignore`
- Test: `tests/unit/router.test.ts`

**Interfaces:**
- Produces: `routes: RouteRecordRaw[]` from `src/router.ts`, with route names `home`, `project` (param `slug`, `props: true`), and `not-found`. Also `tests/setup.ts` exports `media: { reduce: boolean; fine: boolean }` (test-controlled `matchMedia` results), `intersect(el: Element, isIntersecting?: boolean): void` (fires the mocked `IntersectionObserver`), and `resetDom(): void`.

- [ ] **Step 0: Branch and identity check**

```bash
cd /Users/karvin/meini/portfolio-web
git config user.email          # must print karvinnd1207@gmail.com
git switch -c feat/portfolio-site
node -v                        # must print v22.x
```

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "meini-portfolio",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "vite",
    "build": "vite-ssg build && tsx scripts/postbuild.ts",
    "preview": "vite preview --port 4173 --strictPort",
    "typecheck": "vue-tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:build": "vitest run --config vitest.build.config.ts",
    "test:e2e": "playwright test",
    "privacy": "tsx scripts/privacy-check.ts",
    "images:extract": "tsx scripts/extract-images.ts",
    "images:optimize": "tsx scripts/optimize-images.ts",
    "og": "tsx scripts/make-og.ts",
    "links": "tsx scripts/check-links.ts",
    "check": "npm run typecheck && npm run lint && npm run test && npm run build && npm run test:build && npm run privacy && npm run test:e2e"
  }
}
```

`scripts/postbuild.ts` and the other scripts do not exist yet. `npm run build` is first used in Step 10, and Step 9 creates `postbuild.ts`.

- [ ] **Step 2: Install dependencies**

```bash
npm install vue@^3.5.43 vue-router@^4.6.4 @unhead/vue@^2.1.17 @fontsource-variable/inter@^5.3.0
npm install -D vite@^8.3.1 vite-ssg@^28.3.0 @vitejs/plugin-vue@^6.0.9 typescript@~5.9.3 vue-tsc@^3.3.11 \
  tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 vitest@^5.0.2 @vue/test-utils@^2.5.1 jsdom@^30.1.1 \
  @playwright/test@^1.63.0 sharp@^0.35.5 eslint@^10.11.0 @vue/eslint-config-typescript@^14.9.0 \
  eslint-plugin-vue@^10.11.1 prettier@^3.9.9 tsx@^4.23.15 @types/node@^22
```

Expected: the install finishes. A peer warning about `beasties` is fine, because critical-CSS inlining is not used.

- [ ] **Step 3: Write config files**

`.nvmrc`
```
22
```

`.env.example`
```
# Absolute origin used in Open Graph tags. Set this in the Vercel project settings.
VITE_SITE_URL=https://example.vercel.app
```

`.prettierrc.json`
```json
{ "semi": false, "singleQuote": true, "printWidth": 100 }
```

`eslint.config.js`
```js
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'node_modules/**', '.work/**', 'playwright-report/**', 'test-results/**'] },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
)
```

`tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "tests", "scripts", "*.ts"]
}
```

`vite.config.ts`
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

const ssgOptions: ViteSSGOptions = {
  dirStyle: 'nested',
  formatting: 'none',
}

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ssgOptions,
})
```

`vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
})
```

Append to `.gitignore`:
```
.work/
```

- [ ] **Step 4: Write the app shell**

`index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#fbf8ff" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`public/favicon.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d28d9"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="44" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">m</text></svg>
```

`src/env.d.ts`
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

`src/router.ts`
```ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
  {
    path: '/projects/:slug',
    name: 'project',
    component: () => import('./pages/ProjectPage.vue'),
    props: true,
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/NotFoundPage.vue') },
]
```

`src/main.ts`
```ts
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import '@fontsource-variable/inter'
import './styles.css'

export const createApp = ViteSSG(App, {
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    // No `behavior` here: CSS `scroll-behavior` decides, and it respects reduced motion.
    if (to.hash) return { el: to.hash, top: 72 }
    return { top: 0 }
  },
})
```

`src/App.vue` (the nav, footer, and head defaults are added in Task 4)
```vue
<script setup lang="ts"></script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <main id="main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
</template>
```

`src/styles.css`
```css
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
  --color-bg: #fbf8ff;
  --color-bg-2: #f5eefc;
  --color-surface: #ffffff;
  --color-ink: #1e1530;
  --color-muted: #6b5a80;
  --color-primary: #6d28d9;
  --color-primary-ink: #6b21a8;
  --color-primary-soft: #ede4fb;
  --color-accent: #ec4899;
  --color-line: #eadcfb;
}

@layer base {
  html {
    scroll-padding-top: 5rem;
  }
  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }
  body {
    @apply min-h-screen bg-bg font-sans text-ink antialiased;
    background-image: linear-gradient(160deg, var(--color-bg), var(--color-bg-2));
  }
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
    border-radius: 6px;
  }
}

@layer components {
  .section {
    @apply mx-auto max-w-6xl px-4 py-16 sm:px-6;
  }
  .section-title {
    @apply text-2xl font-bold tracking-tight sm:text-3xl;
  }
  .eyebrow {
    @apply text-xs font-semibold tracking-[0.14em] text-primary uppercase;
  }
  .card {
    @apply rounded-2xl border border-line bg-surface;
  }
  .chip {
    @apply inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs text-primary-ink;
  }
  .btn-primary {
    @apply inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgb(109_40_217/0.6)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0;
  }
  .btn-secondary {
    @apply inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0;
  }
}

.skip-link {
  position: absolute;
  left: 1rem;
  top: -3rem;
  z-index: 50;
  @apply rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white;
}
.skip-link:focus {
  top: 1rem;
}

/* Route fade */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Reveal (classes are added by useReveal only after mount) */
.reveal-init {
  opacity: 0;
  transform: translateY(14px);
}
.reveal-in {
  transition:
    opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Project grid filter */
.grid-enter-active,
.grid-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
.grid-move {
  transition: transform 0.3s ease;
}

/* Hero background drift */
@media (prefers-reduced-motion: no-preference) {
  .hero-blob {
    animation: drift 12s ease-in-out infinite alternate;
  }
  .hero-blob--2 {
    animation-delay: -6s;
  }
}
@keyframes drift {
  to {
    transform: translate(-30px, 20px) scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .grid-enter-active,
  .grid-leave-active,
  .grid-move {
    transition: none;
  }
}
```

Temporary pages. Tasks 4 and 5 replace them.

`src/pages/HomePage.vue`
```vue
<template>
  <h1>Home</h1>
</template>
```

`src/pages/ProjectPage.vue`
```vue
<script setup lang="ts">
defineProps<{ slug: string }>()
</script>

<template>
  <h1>{{ slug }}</h1>
</template>
```

`src/pages/NotFoundPage.vue`
```vue
<template>
  <h1>This page does not exist</h1>
</template>
```

- [ ] **Step 5: Write `tests/setup.ts`**

```ts
import { afterEach, vi } from 'vitest'

/** Test-controlled results for window.matchMedia. */
export const media = { reduce: false, fine: true }

type IOCallback = (entries: Array<{ isIntersecting: boolean; target: Element }>) => void
const observers = new Map<Element, IOCallback>()

class FakeIntersectionObserver {
  constructor(private cb: IOCallback) {}
  observe(el: Element) {
    observers.set(el, this.cb)
  }
  unobserve(el: Element) {
    observers.delete(el)
  }
  disconnect() {
    for (const [el, cb] of observers) if (cb === this.cb) observers.delete(el)
  }
  takeRecords() {
    return []
  }
}

/** Fire the IntersectionObserver callback registered for `el`. */
export function intersect(el: Element, isIntersecting = true) {
  observers.get(el)?.([{ isIntersecting, target: el }])
}

// Browser shims. Skipped for test files that run with `@vitest-environment node`.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('reduce') ? media.reduce : query.includes('pointer: fine') ? media.fine : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: FakeIntersectionObserver })

  // jsdom does not implement <dialog> modal behaviour.
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

export function resetDom() {
  media.reduce = false
  media.fine = true
  observers.clear()
}

afterEach(() => resetDom())
```

- [ ] **Step 6: Write the failing router test**

`tests/unit/router.test.ts`
```ts
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
```

- [ ] **Step 7: Run it**

Run: `npm test`
Expected: 4 passed. The routes file already exists, so this test is a guard, not a red-green test. If it fails, fix `src/router.ts`.

- [ ] **Step 8: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 9: Write `scripts/postbuild.ts`**

```ts
// vite-ssg with dirStyle 'nested' writes /404 to dist/404/index.html.
// Static hosts (Vercel) serve dist/404.html for unknown paths, so copy it there.
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const from = resolve(import.meta.dirname, '../dist/404/index.html')
const to = resolve(import.meta.dirname, '../dist/404.html')

if (!existsSync(from)) {
  console.error(`postbuild: ${from} is missing. Is '/404' in includedRoutes?`)
  process.exit(1)
}
copyFileSync(from, to)
console.log('postbuild: wrote dist/404.html')
```

Temporary: `/404` is not in `includedRoutes` until Task 6. For now, `npm run build` is expected to fail at the postbuild step. Run the SSG build directly instead:

- [ ] **Step 10: Build once**

Run: `npx vite-ssg build && ls dist`
Expected: `dist/index.html` exists and contains `<h1>Home</h1>`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vue 3 + vite-ssg + Tailwind project

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content model, content, queries, privacy guard

**Files:**
- Create: `src/content/types.ts`, `src/content/env.ts`, `src/content/images.generated.ts`, `src/content/projects.ts`, `src/content/site.ts`, `src/content/queries.ts`, `src/content/meta.ts`, `scripts/privacy.ts`, `scripts/privacy-check.ts`
- Test: `tests/unit/queries.test.ts`, `tests/unit/content.test.ts`, `tests/unit/privacy.test.ts`, `tests/unit/meta.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `types.ts`: `Category`, `ProjectImage { src; alt; caption?; width; height }`, `Stat { value; label }`, `ExternalLink { label; href }`, `Project`, `Certificate { name; issuer; date }`, `SkillGroup { group; items }`, `Contact { email?; linkedin?; github? }`, `Site`
  - `projects.ts`: `projects: Project[]`
  - `site.ts`: `site: Site`
  - `env.ts`: `siteUrl: string` (no trailing slash)
  - `images.generated.ts`: `projectImages: Record<string, ProjectImage[]>`
  - `queries.ts`: `type Filter = Category | 'all'`, `CATEGORY_LABELS: Record<Category, string>`, `CATEGORY_ORDER: Category[]`, `filterProjects(list, filter): Project[]`, `countByFilter(list): Record<Filter, number>`, `getProject(slug, list?): Project | undefined`, `neighbours(slug, list?): { prev?: Project; next?: Project }`, `featuredProjects(list?): Project[]`, `hasContact(c: Contact): boolean`
  - `meta.ts`: `pageMeta(input: { title: string; description: string; path: string; image: string }): Array<{ name?: string; property?: string; content: string }>` and `canonical(path: string): string`
  - `scripts/privacy.ts`: `findViolations(text: string): Array<{ rule: string; match: string }>`

- [ ] **Step 1: Write the types**

`src/content/types.ts`
```ts
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
```

`src/content/env.ts`
```ts
export const siteUrl = (import.meta.env.VITE_SITE_URL ?? 'http://localhost:4173').replace(/\/+$/, '')
```

`src/content/images.generated.ts` (starting state; Task 7 regenerates it)
```ts
// Generated by scripts/optimize-images.ts — do not edit by hand.
import type { ProjectImage } from './types'

export const projectImages: Record<string, ProjectImage[]> = {}
```

- [ ] **Step 2: Write the failing query tests**

`tests/unit/queries.test.ts`
```ts
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
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run tests/unit/queries.test.ts`
Expected: FAIL — `Cannot find module '../../src/content/queries'` (or `projects`).

- [ ] **Step 4: Write `projects.ts`, `queries.ts`, `site.ts`**

`src/content/projects.ts`
```ts
import type { Project } from './types'
import { projectImages } from './images.generated'

const img = (slug: string) => projectImages[slug] ?? []

export const projects: Project[] = [
  {
    slug: 'google-ads-dashboard',
    title: 'Google Ads Campaign Performance Dashboard',
    category: 'data-bi',
    featured: true,
    course: 'Data Visualization',
    team: 'Individual',
    tools: ['Tableau', 'Excel'],
    summary:
      'Cleaned a messy 2,600-row ads dataset and built an interactive Tableau dashboard on cost, conversions, and revenue.',
    overview:
      'A public Google Ads dataset had typos, mixed date formats, currency symbols, and hundreds of missing values. I cleaned it in Excel, explored it, and published an interactive Tableau dashboard for marketing managers who need to see which devices and keywords actually turn ad spend into revenue.',
    contributions: [
      'Cleaned a raw 2,600-row Google Ads dataset: standardized inconsistent campaign, location, device, and keyword values, unified 3 date formats, and recalculated 626 missing conversion rates, leaving 2,125 analysis-ready rows.',
      'Built and published an interactive Tableau dashboard (heatmap, scatter plot, dual-axis trend, bar chart) with filters, tooltips, and drill-down from device to keyword level.',
      'Found only a weak relationship between ad cost and sales revenue, and recommended optimizing device and keyword combinations instead of raising budget; documented data limitations and potential bias.',
    ],
    stats: [
      { value: 2600, label: 'raw rows' },
      { value: 626, label: 'conversion rates recalculated' },
      { value: 2125, label: 'analysis-ready rows' },
    ],
    links: [
      {
        label: 'View dashboard',
        href: 'https://public.tableau.com/app/profile/meini.rusiadi/viz/FinalProjectTableau_17803906517840/Dashboard1',
      },
      { label: 'Video walkthrough', href: 'https://www.youtube.com/watch?v=7pYhSJ-0Jeg' },
    ],
    images: img('google-ads-dashboard'),
  },
  {
    slug: 'ai-acceptance-research',
    title: 'Student Resistance and Acceptance of AI-Based Systems',
    category: 'data-bi',
    featured: true,
    course: 'Research Methods',
    team: 'Co-author · 3 authors',
    role: 'Co-author',
    tools: ['SmartPLS 4', 'PLS-SEM', 'Technology Acceptance Model'],
    summary:
      'Quantitative study of what drives university students to accept or resist AI tools, analysed with PLS-SEM.',
    overview:
      'An unpublished research paper in IEEE format. It extends the Technology Acceptance Model to explain how trust, task characteristics, and technology characteristics shape how students feel about AI tools such as ChatGPT. The data came from a survey of university students who already use generative AI.',
    contributions: [
      'Processed questionnaire data (290 responses screened to 281 valid) and co-ran the PLS-SEM analysis in SmartPLS 4.',
      'Wrote the Methodology section and prepared the results tables. All 5 hypotheses were supported.',
      'Searched for relevant journals and contributed to the Conclusion.',
    ],
    stats: [
      { value: 290, label: 'survey responses' },
      { value: 281, label: 'valid after screening' },
      { value: 5, label: 'hypotheses supported' },
    ],
    links: [{ label: 'Research data (Zenodo)', href: 'https://zenodo.org/records/20282568' }],
    images: img('ai-acceptance-research'),
  },
  {
    slug: 'budgetwise-finance-dashboard',
    title: 'Personal Finance Dashboard (BudgetWise)',
    category: 'data-bi',
    course: 'Data Modelling',
    term: 'Even 2025/2026',
    team: 'Group of 6',
    tools: ['Excel', 'PivotTable', 'Data Validation'],
    summary:
      'Cleaned a synthetic personal-finance dataset and built an interactive Excel dashboard with 7 KPIs.',
    overview:
      'The BudgetWise dataset mixes income and expense transactions from 10 Indian cities. It has missing values, duplicates, mixed date formats, and many spellings of the same category. The team built an Excel dashboard to show where money goes, which payment methods people use, and whether income covers expenses.',
    contributions: [
      'Cleaned 5,596 transactions down to 5,281 valid rows: removed 315 invalid or extreme amounts, flagged duplicates, unified 3 date formats, stripped currency symbols (Rs., ₹, $, INR), and mapped 27+ category spellings to 9 and 20+ city variants to 10 with lookup tables.',
      'Built an interactive Excel dashboard with 7 KPIs (income, expense, net balance, expense ratio, and more), slicers for year, category, payment mode, and location, and an INDEX/MATCH KPI selector.',
    ],
    stats: [
      { value: 5596, label: 'raw rows' },
      { value: 5281, label: 'clean rows' },
      { value: 7, label: 'KPIs' },
    ],
    images: img('budgetwise-finance-dashboard'),
  },
  {
    slug: 'ecommerce-order-analysis',
    title: 'E-commerce Order Analysis',
    category: 'data-bi',
    course: 'Data Modelling (Lab)',
    term: 'Even 2025/2026',
    team: 'Group of 3',
    tools: ['Excel', 'Named ranges', 'Data Validation'],
    summary:
      'Prepared a multi-table e-commerce dataset in Excel and built reusable named ranges for the dashboard.',
    overview:
      'A lab project on a public e-commerce order dataset with separate tables for customers, orders, order items, products, and payments. The team cleaned the data, modelled it, and built an interactive Excel dashboard.',
    contributions: [
      'Cleaned a multi-table e-commerce dataset: standardized city, state, and product category text, and added derived columns for item total with shipping, product volume, delivery days, and approval time in hours.',
      'Split order timestamps into year, month, and day of week for trend analysis.',
      'Built named ranges for category, payment type, and order status lists that drive dropdown validation and COUNTIF/INDEX summary tables, so a new category updates the summaries without editing any formula.',
    ],
    images: img('ecommerce-order-analysis'),
  },
  {
    slug: 'shoe-factory-database',
    title: 'Shoe Factory Database',
    category: 'database',
    course: 'Database Fundamentals',
    team: 'Group of 5',
    tools: ['Oracle SQL', 'MongoDB', 'Python (PyMongo)'],
    summary:
      'Designed the data model for a shoe factory and wrote Oracle SQL queries with MongoDB equivalents.',
    overview:
      'A case study of a shoe manufacturer that needs to track production, orders, purchasing, payments, and goods receipt. The project covers the database design and a set of Oracle SQL queries, each paired with a MongoDB version in Python.',
    contributions: [
      'Designed the ERD and data dictionary for 6 tables covering production, orders, purchasing, payment, and goods receipt.',
      'Wrote the DDL and Oracle SQL examples for single-row functions, cross and natural joins, and aggregate queries (COUNT, SUM, AVG, GROUP BY, HAVING, and more), each with a MongoDB aggregation pipeline equivalent in Python.',
    ],
    images: img('shoe-factory-database'),
  },
  {
    slug: 'soundease-database',
    title: 'SoundEase Audio Store Database',
    category: 'database',
    course: 'Database (Lab)',
    term: 'Even 2024/2025',
    team: 'Group of 4',
    tools: ['Oracle SQL'],
    summary: 'Wrote reporting queries for an audio equipment store database in Oracle SQL.',
    overview:
      'A lab project for an audio equipment store with staff, vendors, customers, equipment, and purchase and sales transactions. The team designed 9 tables with CHECK constraints and wrote 10 reporting queries.',
    contributions: [
      'Wrote 3 reporting queries that join 4 tables and filter against dataset-wide values with subqueries (MIN, AVG), with output formatted by TO_CHAR.',
    ],
    images: img('soundease-database'),
  },
  {
    slug: 'livetix-testing',
    title: 'LiveTix Concert Ticketing — Test Design',
    category: 'qa',
    course: 'Testing & Systems Implementation',
    term: 'Odd 2025/2026',
    team: 'Group of 4',
    role: 'QA Engineer',
    tools: ['Black-box testing', 'Functional testing', 'Figma'],
    summary: 'Designed 17 black-box functional test cases for a concert ticketing app.',
    overview:
      'LiveTix is a mobile app concept for buying concert tickets without crashes, unclear prices, or fake tickets. I took the QA role: deciding what to test and writing the test cases for the full purchase flow.',
    contributions: [
      'Wrote the business process for a concert ticketing app: event discovery, seat selection, checkout, QR tickets, and wishlist.',
      'Designed 17 black-box functional test cases covering onboarding, sign-up and login (including invalid credentials), search, seat selection, payment, QR ticket display, wishlist, and profile edit.',
      'Built the Figma prototype.',
    ],
    stats: [{ value: 17, label: 'test cases designed' }],
    images: img('livetix-testing'),
  },
  {
    slug: 'snapcash-pos',
    title: 'SnapCash POS — Project Plan',
    category: 'systems-pm',
    featured: true,
    course: 'IS Project Management',
    term: 'Even 2025/2026',
    team: 'Group of 5',
    tools: ['Scrum', 'Critical Path Method', 'Business case'],
    summary:
      'Planned a SaaS point-of-sale product for Indonesian F&B small businesses: business case, Scrum charter, and critical path.',
    overview:
      'SnapCash is a point-of-sale and business management app for small food and beverage businesses that still record sales by hand. The project plans its delivery with Scrum across 6 sprints, with a budget, a risk register, and a 5-year financial projection.',
    contributions: [
      'Wrote the business case for a SaaS POS for Indonesian F&B MSMEs: 3 subscription tiers (Rp100k to Rp1.5M per month) and a 5-year projection from a Rp90M first-year loss to break-even in year 2.',
      'Wrote the project charter: an 18-item product backlog, 6 two-week sprints with story points, team roles, and a Definition of Done.',
      'Built the Critical Path Method schedule.',
    ],
    stats: [
      { value: 18, label: 'backlog items' },
      { value: 6, label: 'sprints' },
      { value: 3, label: 'pricing tiers' },
    ],
    images: img('snapcash-pos'),
  },
  {
    slug: 'stsport-booking-system',
    title: 'StSport Booking System',
    category: 'systems-pm',
    course: 'Systems Analysis & Design',
    term: 'Odd 2025/2026',
    team: 'Group of 4',
    tools: ['UML', 'Fishbone diagram', 'Context diagram'],
    summary: 'Analysed and modeled a sports-court booking and equipment store system.',
    overview:
      'StSport lets customers book sports courts and buy sports equipment, while partner staff confirm bookings and admins create reports. The project analyses the problem and models the system before any code is written.',
    contributions: [
      'Analysed the problem with a fishbone diagram, and scoped the system with a context diagram and a use case diagram.',
      'Modeled the design with a class diagram, a state transition diagram, and activity diagrams for 7 flows: registration, booking, cancellation, equipment purchase, staff confirmation, and two reports.',
    ],
    images: img('stsport-booking-system'),
  },
  {
    slug: 'tix-id-redesign',
    title: 'TIX ID App Redesign',
    category: 'ux',
    course: 'UX Research & Design',
    term: 'Odd 2024/2025',
    team: 'Group of 3',
    role: 'Business Process Owner',
    tools: ['Figma', 'Design thinking'],
    summary: 'Redesigned the TIX ID movie ticket app so tickets and snacks are ordered in one checkout.',
    overview:
      'TIX ID is an Indonesian app for buying cinema tickets. Users found its home page cluttered, and they had to pay for tickets and snacks separately. The project followed design thinking from user research to a prototype.',
    contributions: [
      'Grouped Play Store user reviews into pain points, then built the user persona, user journey, and use case.',
      'Redesigned the Home page (vertical movie list, less clutter) and the bottom navigation (added F&B and Profile tabs), and merged ticket and F&B ordering into one checkout with a Skip option.',
      'Built the interactive Figma prototype.',
    ],
    images: img('tix-id-redesign'),
  },
  {
    slug: 'edupal-ai-teacher',
    title: 'EduPal — AI Teacher Assistant',
    category: 'ux',
    course: 'Foundations of AI',
    team: 'Group of 6',
    tools: ['Figma', 'NLP (concept)'],
    summary: 'Designed an AI learning app that keeps classes going when a teacher is absent.',
    overview:
      'When a teacher is absent, students often get a worksheet and no explanation. EduPal is a design concept for an app where AI explains the material, answers questions, and gives feedback on assignments. It was designed, not built.',
    contributions: [
      'Proposed the project idea: an app that keeps classes running when a teacher is absent.',
      'Wrote the background (Chapter 1) and the AI feature design (Chapter 4): NLP question answering, material recommendations, automatic assignment feedback, and a 24/7 chatbot.',
      'Designed the Figma prototype: sign-up by role, class schedule, AI-generated materials, Ask AI, assignment upload, and profile.',
    ],
    images: img('edupal-ai-teacher'),
  },
]
```

`src/content/queries.ts`
```ts
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
```

`src/content/site.ts`
```ts
import type { Site } from './types'
import { projects } from './projects'

export const site: Site = {
  name: 'Meini Rusiadi',
  shortName: 'meini.',
  roles: ['Data & BI Analyst', 'QA', 'Database'],
  headline: { lead: 'Turning messy data into', highlight: 'clear decisions' },
  intro:
    'Information Systems student at BINUS University. I clean data, build dashboards, write SQL, and design test cases.',
  cvUrl: undefined, // spec §13 item 2 — set to '/cv.pdf' once Meini provides the file
  contact: {}, // spec §13 item 3 — email / linkedin / github from Meini
  stats: [
    { value: projects.length, label: 'projects' },
    { value: 281, label: 'survey responses analysed' },
    { value: 2125, label: 'rows cleaned for one dashboard' },
    { value: 2, label: 'certificates' },
  ],
  skills: [
    { group: 'Data & BI', items: ['Tableau', 'Excel', 'PivotTable', 'Data cleaning', 'SmartPLS 4'] },
    { group: 'Database', items: ['Oracle SQL', 'MongoDB', 'ERD & data dictionary'] },
    { group: 'Quality assurance', items: ['Test case design', 'Black-box testing', 'Functional testing'] },
    { group: 'Analysis & PM', items: ['UML', 'Context & fishbone diagrams', 'Scrum', 'Critical Path Method', 'Business case'] },
    { group: 'UX', items: ['Figma', 'Design thinking', 'User persona & journey'] },
  ],
  certificates: [
    {
      name: 'Applied Database Systems using Oracle AI Database',
      issuer: 'Oracle Academy',
      date: 'June 2026',
    },
    {
      name: 'Good Achievement — Student Advisory and Support Center Mentoring Program',
      issuer: 'BINUS University',
      date: 'June 2026',
    },
  ],
}
```

The two comments in `site.ts` point at spec §13 open items. They are data that is waiting for Meini, not deferred code, and they are tracked in the spec until a GitHub repo exists.

- [ ] **Step 5: Run the query tests**

Run: `npx vitest run tests/unit/queries.test.ts`
Expected: 7 passed.

- [ ] **Step 6: Write the failing content, meta, and privacy tests**

`tests/unit/content.test.ts`
```ts
// @vitest-environment node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { projects } from '../../src/content/projects'
import { site } from '../../src/content/site'
import { CATEGORY_ORDER } from '../../src/content/queries'

const publicDir = resolve(import.meta.dirname, '../../public')

describe('projects content', () => {
  it('has 11 projects', () => {
    expect(projects).toHaveLength(11)
  })
  it('uses unique kebab-case slugs', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })
  it('gives every project a valid category, text, tools, and at least one contribution', () => {
    for (const p of projects) {
      expect(CATEGORY_ORDER).toContain(p.category)
      expect(p.title.trim()).not.toBe('')
      expect(p.summary.trim()).not.toBe('')
      expect(p.overview.trim()).not.toBe('')
      expect(p.tools.length).toBeGreaterThan(0)
      expect(p.contributions.length).toBeGreaterThan(0)
    }
  })
  it('features exactly the 3 agreed projects', () => {
    expect(projects.filter((p) => p.featured).map((p) => p.slug)).toEqual([
      'google-ads-dashboard',
      'ai-acceptance-research',
      'snapcash-pos',
    ])
  })
  it('only links over https', () => {
    for (const p of projects) for (const l of p.links ?? []) expect(l.href).toMatch(/^https:\/\//)
  })
  it('points every image at a file that exists, with alt text and a size', () => {
    for (const p of projects)
      for (const img of p.images) {
        expect(existsSync(resolve(publicDir, `.${img.src}`)), img.src).toBe(true)
        expect(img.alt.trim()).not.toBe('')
        expect(img.width).toBeGreaterThan(0)
        expect(img.height).toBeGreaterThan(0)
      }
  })
  it('keeps content rules from the spec', () => {
    const text = JSON.stringify(projects)
    expect(text).not.toMatch(/power query/i)
    expect(text).not.toMatch(/selenium|postman/i)
    expect(text).not.toMatch(/LT-001/)
  })
})

describe('site content', () => {
  it('derives the project count from the project list', () => {
    expect(site.stats[0]).toEqual({ value: projects.length, label: 'projects' })
  })
})
```

`tests/unit/meta.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { canonical, pageMeta } from '../../src/content/meta'

describe('pageMeta', () => {
  it('builds absolute og:url and og:image from the site origin', () => {
    const meta = pageMeta({ title: 'T', description: 'D', path: '/projects/x', image: '/og/x.png' })
    const get = (key: string) => meta.find((m) => m.property === key || m.name === key)?.content
    expect(get('og:title')).toBe('T')
    expect(get('description')).toBe('D')
    expect(get('og:url')).toBe('http://localhost:4173/projects/x')
    expect(get('og:image')).toBe('http://localhost:4173/og/x.png')
    expect(get('twitter:card')).toBe('summary_large_image')
  })
  it('builds canonical URLs', () => {
    expect(canonical('/')).toBe('http://localhost:4173/')
  })
})
```

`tests/unit/privacy.test.ts`
```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { findViolations } from '../../scripts/privacy'
import { projects } from '../../src/content/projects'
import { site } from '../../src/content/site'

// Test inputs are built by concatenation, so this file never contains a literal
// that the repo-wide privacy check would flag.
const fakeId = '28' + '00000000'
const fakeCampusMail = 'x.y' + '@' + 'binus.ac.id'
const fakeCanvaEdit = 'https://www.canva.com/design/DAGabc/xyz/' + 'edit?utm=1'

describe('findViolations', () => {
  it('flags a student ID', () => {
    expect(findViolations(`NIM ${fakeId} here`)).toEqual([{ rule: 'student-id', match: fakeId }])
  })
  it('flags a campus email', () => {
    expect(findViolations(`mail ${fakeCampusMail}`)[0]?.rule).toBe('campus-email')
  })
  it('flags a Canva edit link', () => {
    expect(findViolations(fakeCanvaEdit)[0]?.rule).toBe('canva-edit')
  })
  it('does not flag normal numbers, prices, or dates', () => {
    expect(findViolations('2,125 rows, Rp 1,500,000, 20282568, 2026-09-29, 12345678901')).toEqual([])
  })
  it('finds nothing in the published content', () => {
    expect(findViolations(JSON.stringify({ projects, site }))).toEqual([])
  })
})
```

The Zenodo record `20282568` has 8 digits and the student ID pattern needs `28` + 8 digits (10 total), so it must not match. `12345678901` has 11 digits and starts with `1`, so it does not match either.

- [ ] **Step 7: Run to verify they fail**

Run: `npx vitest run tests/unit/meta.test.ts tests/unit/privacy.test.ts`
Expected: FAIL — cannot find `meta` / `privacy` modules.

- [ ] **Step 8: Implement `meta.ts`, `privacy.ts`, `privacy-check.ts`**

`src/content/meta.ts`
```ts
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
```

`scripts/privacy.ts`
```ts
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
```

`scripts/privacy-check.ts`
```ts
// Scans every committed text file and the build output for personal data.
// Usage: npm run privacy   (exit code 1 if anything is found)
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { findViolations } from './privacy'

const root = resolve(import.meta.dirname, '..')
const TEXT = /\.(ts|js|mjs|vue|css|html|json|md|svg|txt|xml|webmanifest)$/

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean)
  .map((f) => join(root, f))
const files = [...tracked, ...walk(join(root, 'dist'))].filter((f) => TEXT.test(f))

let failures = 0
for (const file of files) {
  for (const v of findViolations(readFileSync(file, 'utf8'))) {
    failures++
    console.error(`${relative(root, file)}: ${v.rule} → ${v.match}`)
  }
}

if (failures) {
  console.error(`privacy-check: ${failures} problem(s) found`)
  process.exit(1)
}
console.log(`privacy-check: ${files.length} files clean`)
```

- [ ] **Step 9: Run all unit tests and the privacy check**

Run: `npm test && npm run privacy`
Expected: all tests pass (the image test passes trivially because the image lists are empty). The privacy check prints `files clean`.

- [ ] **Step 10: Typecheck, lint, commit**

```bash
npm run typecheck && npm run lint
git add -A
git commit -m "feat: add content model, project content, and privacy guard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Motion composables

**Files:**
- Create: `src/composables/motion.ts`, `src/composables/useReveal.ts`, `src/composables/useTilt.ts`, `src/composables/useCountUp.ts`, `src/composables/useMagnetic.ts`
- Test: `tests/unit/motion.test.ts`

**Interfaces:**
- Consumes: `media`, `intersect` from `tests/setup.ts`.
- Produces:
  - `motionAllowed(): boolean`, `finePointer(): boolean`. Client-only: call them in `onMounted` or event handlers only.
  - `useReveal(el: Ref<HTMLElement | null>, delayMs?: number): void`
  - `MAX_TILT = 8`, `tiltFromPointer(clientX, clientY, rect, max?): { rotateX: number; rotateY: number }`, `useTilt(el: Ref<HTMLElement | null>): void`
  - `COUNT_DURATION = 1200`, `easeOutCubic(p): number`, `countValueAt(target, elapsedMs, duration?): number`, `useCountUp(target: number, el: Ref<HTMLElement | null>, duration?): Ref<number>`
  - `MAX_MAGNET = 6`, `magneticOffset(clientX, clientY, rect, max?): { x: number; y: number }`, `useMagnetic(el: Ref<HTMLElement | null>): void`

- [ ] **Step 1: Write the failing tests**

`tests/unit/motion.test.ts`
```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { intersect, media } from '../setup'
import { countValueAt, easeOutCubic, useCountUp } from '../../src/composables/useCountUp'
import { tiltFromPointer, useTilt } from '../../src/composables/useTilt'
import { magneticOffset, useMagnetic } from '../../src/composables/useMagnetic'
import { useReveal } from '../../src/composables/useReveal'

const rect = { left: 0, top: 0, width: 200, height: 100 }

/** Mount a component whose root element uses a composable. */
function host(use: (el: ReturnType<typeof ref<HTMLElement | null>>) => unknown) {
  let exposed: unknown
  const C = defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      exposed = use(el)
      return () => h('div', { ref: el }, 'x')
    },
  })
  const wrapper = mount(C, { attachTo: document.body })
  return { wrapper, el: wrapper.element as HTMLElement, exposed }
}

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('pure helpers', () => {
  it('easeOutCubic goes from 0 to 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875)
  })
  it('countValueAt clamps before start and after the end', () => {
    expect(countValueAt(2125, -10)).toBe(0)
    expect(countValueAt(2125, 600, 1200)).toBe(Math.round(2125 * 0.875))
    expect(countValueAt(2125, 99999)).toBe(2125)
  })
  it('tiltFromPointer is 0 at the centre and max at the corners', () => {
    expect(tiltFromPointer(100, 50, rect)).toEqual({ rotateX: 0, rotateY: 0 })
    expect(tiltFromPointer(200, 100, rect)).toEqual({ rotateX: -8, rotateY: 8 })
    expect(tiltFromPointer(9999, -9999, rect)).toEqual({ rotateX: 8, rotateY: 8 })
  })
  it('magneticOffset is capped at 6px', () => {
    expect(magneticOffset(100, 50, rect)).toEqual({ x: 0, y: 0 })
    expect(magneticOffset(9999, 9999, rect)).toEqual({ x: 6, y: 6 })
  })
})

describe('useCountUp', () => {
  it('starts at the final value (this is what SSR renders)', () => {
    media.reduce = true
    const { exposed } = host((el) => useCountUp(2125, el))
    expect((exposed as { value: number }).value).toBe(2125)
  })
  it('stays at the final value when motion is reduced', async () => {
    media.reduce = true
    const { exposed, el } = host((el) => useCountUp(2125, el))
    await nextTick()
    intersect(el)
    expect((exposed as { value: number }).value).toBe(2125)
  })
  it('counts from 0 to the target once visible', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
    const { exposed, el } = host((el) => useCountUp(2125, el))
    await nextTick()
    const value = exposed as { value: number }
    expect(value.value).toBe(0)
    intersect(el)
    vi.advanceTimersByTime(600)
    expect(value.value).toBeGreaterThan(0)
    expect(value.value).toBeLessThan(2125)
    vi.advanceTimersByTime(1000)
    expect(value.value).toBe(2125)
  })
})

describe('useTilt', () => {
  it('rotates on pointer move and resets on leave', () => {
    const { el } = host((el) => useTilt(el))
    el.getBoundingClientRect = () => ({ ...rect, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} })
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toContain('rotateX(-8.00deg)')
    el.dispatchEvent(new MouseEvent('pointerleave'))
    expect(el.style.transform).toBe('')
  })
  it('does nothing when motion is reduced', () => {
    media.reduce = true
    const { el } = host((el) => useTilt(el))
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toBe('')
  })
  it('does nothing on touch screens', () => {
    media.fine = false
    const { el } = host((el) => useTilt(el))
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toBe('')
  })
})

describe('useMagnetic', () => {
  it('moves toward the pointer and resets on leave', () => {
    const { el } = host((el) => useMagnetic(el))
    el.getBoundingClientRect = () => ({ ...rect, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} })
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toBe('translate(6.00px, 6.00px)')
    el.dispatchEvent(new MouseEvent('pointerleave'))
    expect(el.style.transform).toBe('')
  })
})

describe('useReveal', () => {
  const below = { top: 5000, left: 0, width: 10, height: 10, right: 10, bottom: 5010, x: 0, y: 5000, toJSON() {} }

  it('never hides an element that is already on screen', async () => {
    const { el } = host((el) => useReveal(el))
    await nextTick()
    expect(el.classList.contains('reveal-init')).toBe(false)
  })
  it('hides a below-the-fold element, then reveals it with the stagger delay', async () => {
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(below as DOMRect)
    const { el } = host((el) => useReveal(el, 160))
    await nextTick()
    expect(el.classList.contains('reveal-init')).toBe(true)
    intersect(el)
    expect(el.classList.contains('reveal-init')).toBe(false)
    expect(el.classList.contains('reveal-in')).toBe(true)
    expect(el.style.transitionDelay).toBe('160ms')
    spy.mockRestore()
  })
  it('does nothing when motion is reduced, so content is always visible', async () => {
    media.reduce = true
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(below as DOMRect)
    const { el } = host((el) => useReveal(el))
    await nextTick()
    expect(el.classList.contains('reveal-init')).toBe(false)
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/unit/motion.test.ts`
Expected: FAIL — cannot find the composable modules.

- [ ] **Step 3: Implement the composables**

`src/composables/motion.ts`
```ts
// Client-only. Call these inside onMounted or event handlers, never during setup,
// so that SSR and the first client render produce identical HTML.

export function motionAllowed(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function finePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
```

`src/composables/useReveal.ts`
```ts
import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { motionAllowed } from './motion'

/**
 * Fades an element up the first time it scrolls into view.
 * Elements that are already visible on load are never hidden, so there is no flash.
 */
export function useReveal(el: Ref<HTMLElement | null>, delayMs = 0): void {
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    const node = el.value
    if (!node || !motionAllowed()) return
    if (node.getBoundingClientRect().top < window.innerHeight) return

    node.classList.add('reveal-init')
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        node.style.transitionDelay = `${delayMs}ms`
        node.classList.add('reveal-in')
        node.classList.remove('reveal-init')
        observer?.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
  })

  onBeforeUnmount(() => observer?.disconnect())
}
```

`src/composables/useTilt.ts`
```ts
import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { finePointer, motionAllowed } from './motion'

export const MAX_TILT = 8

type Box = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
const half = (v: number) => Math.max(-0.5, Math.min(0.5, v))

export function tiltFromPointer(clientX: number, clientY: number, rect: Box, max = MAX_TILT) {
  const x = half((clientX - rect.left) / rect.width - 0.5)
  const y = half((clientY - rect.top) / rect.height - 0.5)
  return { rotateX: -y * 2 * max + 0, rotateY: x * 2 * max + 0 } // + 0 turns -0 into 0
}

export function useTilt(el: Ref<HTMLElement | null>): void {
  function onMove(e: PointerEvent | MouseEvent) {
    const node = el.value
    if (!node || !motionAllowed() || !finePointer()) return
    const { rotateX, rotateY } = tiltFromPointer(e.clientX, e.clientY, node.getBoundingClientRect())
    node.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`
  }
  function onLeave() {
    if (el.value) el.value.style.transform = ''
  }
  onMounted(() => {
    el.value?.addEventListener('pointermove', onMove)
    el.value?.addEventListener('pointerleave', onLeave)
  })
  onBeforeUnmount(() => {
    el.value?.removeEventListener('pointermove', onMove)
    el.value?.removeEventListener('pointerleave', onLeave)
  })
}
```

`src/composables/useMagnetic.ts`
```ts
import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { finePointer, motionAllowed } from './motion'

export const MAX_MAGNET = 6

type Box = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
const unit = (v: number) => Math.max(-1, Math.min(1, v))

export function magneticOffset(clientX: number, clientY: number, rect: Box, max = MAX_MAGNET) {
  const x = unit((clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * max
  const y = unit((clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * max
  return { x: x + 0, y: y + 0 } // + 0 turns -0 into 0
}

export function useMagnetic(el: Ref<HTMLElement | null>): void {
  function onMove(e: PointerEvent | MouseEvent) {
    const node = el.value
    if (!node || !motionAllowed() || !finePointer()) return
    const { x, y } = magneticOffset(e.clientX, e.clientY, node.getBoundingClientRect())
    node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
  }
  function onLeave() {
    if (el.value) el.value.style.transform = ''
  }
  onMounted(() => {
    el.value?.addEventListener('pointermove', onMove)
    el.value?.addEventListener('pointerleave', onLeave)
  })
  onBeforeUnmount(() => {
    el.value?.removeEventListener('pointermove', onMove)
    el.value?.removeEventListener('pointerleave', onLeave)
  })
}
```

`src/composables/useCountUp.ts`
```ts
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { motionAllowed } from './motion'

export const COUNT_DURATION = 1200

export const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)

export function countValueAt(target: number, elapsedMs: number, duration = COUNT_DURATION): number {
  const p = Math.min(Math.max(elapsedMs / duration, 0), 1)
  return Math.round(target * easeOutCubic(p))
}

/**
 * Returns a number that equals `target` during SSR and without motion.
 * With motion, it resets to 0 after mount and counts up once `el` is visible.
 */
export function useCountUp(
  target: number,
  el: Ref<HTMLElement | null>,
  duration = COUNT_DURATION,
): Ref<number> {
  const value = ref(target)
  let observer: IntersectionObserver | undefined
  let frame = 0

  function run() {
    let start: number | undefined
    const step = (t: number) => {
      start ??= t
      value.value = countValueAt(target, t - start, duration)
      if (t - start < duration) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  onMounted(() => {
    if (!el.value || !motionAllowed()) return
    value.value = 0
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer?.disconnect()
        run()
      },
      { threshold: 0.4 },
    )
    observer.observe(el.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    cancelAnimationFrame(frame)
  })

  return value
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/unit/motion.test.ts`
Expected: all pass. The `+ 0` in `tiltFromPointer` and `magneticOffset` matters, because Vitest's `toEqual` treats `-0` and `0` as different.

- [ ] **Step 5: Full test run, typecheck, lint, commit**

```bash
npm test && npm run typecheck && npm run lint
git add -A
git commit -m "feat: add motion composables with reduced-motion support

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Home page

**Files:**
- Create: `src/components/AppNav.vue`, `AppFooter.vue`, `RevealItem.vue`, `HeroSection.vue`, `StatNumber.vue`, `StatsStrip.vue`, `ProjectCard.vue`, `ProjectFilter.vue`, `SkillsSection.vue`, `CertificatesSection.vue`, `ContactSection.vue`, `tests/unit/helpers.ts`
- Modify: `src/App.vue`, `src/pages/HomePage.vue`
- Test: `tests/unit/home.test.ts`

**Interfaces:**
- Consumes: everything from `src/content/*` (Task 2) and the composables (Task 3).
- Produces:
  - `tests/unit/helpers.ts`: `mountWithApp(component: Component, props?: Record<string, unknown>, path?: string): Promise<VueWrapper>` (router + head installed, attached to `document.body`)
  - Components with props: `ProjectCard { project: Project }`, `ProjectFilter` (`v-model: Filter`, prop `counts: Record<Filter, number>`), `StatsStrip { stats: Stat[] }`, `StatNumber { value: number; label: string }`, `RevealItem { index?: number }` (default slot), `SkillsSection { groups: SkillGroup[] }`, `CertificatesSection { certificates: Certificate[] }`, `ContactSection { contact: Contact; cvUrl?: string }`

- [ ] **Step 1: Write the test helper and the failing home tests**

`tests/unit/helpers.ts`
```ts
import { mount, type VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createHead } from '@unhead/vue/client'
import { routes } from '../../src/router'

export async function mountWithApp(
  component: Component,
  props: Record<string, unknown> = {},
  path = '/',
): Promise<VueWrapper> {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mount(component as any, {
    props,
    attachTo: document.body,
    global: { plugins: [router, createHead()] },
  })
}
```

`tests/unit/home.test.ts`
```ts
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mountWithApp } from './helpers'
import HomePage from '../../src/pages/HomePage.vue'
import ProjectFilter from '../../src/components/ProjectFilter.vue'
import ContactSection from '../../src/components/ContactSection.vue'
import StatNumber from '../../src/components/StatNumber.vue'
import { media } from '../setup'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('HomePage', () => {
  it('renders the headline and one card per project', async () => {
    const w = await mountWithApp(HomePage)
    expect(w.find('h1').text()).toContain('clear decisions')
    expect(w.findAll('#work li')).toHaveLength(11)
  })
  it('shows 3 featured cards', async () => {
    const w = await mountWithApp(HomePage)
    expect(w.findAll('#featured article')).toHaveLength(3)
  })
  it('filters the grid when a chip is pressed', async () => {
    const w = await mountWithApp(HomePage)
    const qa = w.findAll('#work button').find((b) => b.text().startsWith('QA'))!
    await qa.trigger('click')
    await nextTick()
    expect(qa.attributes('aria-pressed')).toBe('true')
    const items = w.findAll('#work li')
    expect(items).toHaveLength(1)
    expect(items[0]!.text()).toContain('LiveTix')
  })
  it('hides the contact section and the CV button while that data is missing', async () => {
    const w = await mountWithApp(HomePage)
    expect(w.find('#contact').exists()).toBe(false)
    expect(w.text()).not.toContain('Download CV')
  })
})

describe('ProjectFilter', () => {
  it('marks only the active chip as pressed and shows counts', async () => {
    const w = await mountWithApp(ProjectFilter, {
      modelValue: 'all',
      counts: { all: 11, 'data-bi': 4, database: 2, qa: 1, 'systems-pm': 2, ux: 2 },
    })
    const pressed = w.findAll('button').filter((b) => b.attributes('aria-pressed') === 'true')
    expect(pressed.map((b) => b.text())).toEqual(['All 11'])
  })
})

describe('ContactSection', () => {
  it('renders only the links that exist', async () => {
    const w = await mountWithApp(ContactSection, { contact: { email: 'meini@example.com' } })
    expect(w.find('a[href="mailto:meini@example.com"]').exists()).toBe(true)
    expect(w.text()).not.toContain('LinkedIn')
  })
})

describe('StatNumber', () => {
  it('shows the formatted final number when motion is reduced', async () => {
    media.reduce = true
    const w = await mountWithApp(StatNumber, { value: 2125, label: 'rows' })
    await nextTick()
    expect(w.text()).toContain('2,125')
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/unit/home.test.ts`
Expected: FAIL — missing components, and the temporary HomePage has no `#work`.

- [ ] **Step 3: Implement the components**

`src/components/RevealItem.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'

const props = withDefaults(defineProps<{ index?: number }>(), { index: 0 })
const el = ref<HTMLElement | null>(null)
useReveal(el, props.index * 80)
</script>

<template>
  <div ref="el"><slot /></div>
</template>
```

`src/components/AppNav.vue`
```vue
<script setup lang="ts">
import { site } from '../content/site'
import { hasContact } from '../content/queries'

const links = [
  { label: 'Work', to: '/#work', mobile: true },
  { label: 'Skills', to: '/#skills', mobile: true },
  { label: 'Certificates', to: '/#certificates', mobile: false },
  ...(hasContact(site.contact) ? [{ label: 'Contact', to: '/#contact', mobile: true }] : []),
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Main">
      <RouterLink to="/" class="text-lg font-bold tracking-tight text-ink">{{ site.shortName }}</RouterLink>
      <ul class="flex gap-4 text-sm text-muted sm:gap-6">
        <li v-for="l in links" :key="l.to" :class="l.mobile ? '' : 'hidden sm:block'">
          <RouterLink :to="l.to" class="hover:text-primary">{{ l.label }}</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
```

`src/components/AppFooter.vue`
```vue
<script setup lang="ts">
import { site } from '../content/site'
</script>

<template>
  <footer class="border-t border-line/70">
    <div class="mx-auto max-w-6xl px-4 py-8 text-sm text-muted sm:px-6">
      {{ site.name }} · Information Systems, BINUS University
    </div>
  </footer>
</template>
```

`src/components/HeroSection.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { site } from '../content/site'
import { useMagnetic } from '../composables/useMagnetic'

const magnet = ref<HTMLElement | null>(null)
useMagnetic(magnet)
</script>

<template>
  <section class="relative overflow-hidden" aria-labelledby="hero-title">
    <div aria-hidden="true" class="hero-blob pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#e9d5ff] blur-3xl"></div>
    <div aria-hidden="true" class="hero-blob hero-blob--2 pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#fbcfe8] blur-3xl"></div>
    <div class="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
      <p class="eyebrow">{{ site.roles.join(' · ') }}</p>
      <h1 id="hero-title" class="mt-3 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
        {{ site.headline.lead }} <span class="text-primary">{{ site.headline.highlight }}</span>
      </h1>
      <p class="mt-5 max-w-xl text-base text-muted sm:text-lg">{{ site.intro }}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <span ref="magnet" class="inline-block transition-transform duration-200 motion-reduce:transition-none">
          <RouterLink to="/#work" class="btn-primary">View projects</RouterLink>
        </span>
        <a v-if="site.cvUrl" :href="site.cvUrl" download class="btn-secondary">Download CV</a>
      </div>
    </div>
  </section>
</template>
```

`src/components/StatNumber.vue`
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCountUp } from '../composables/useCountUp'

const props = defineProps<{ value: number; label: string }>()
const el = ref<HTMLElement | null>(null)
const current = useCountUp(props.value, el)
const shown = computed(() => current.value.toLocaleString('en-US'))
const final = computed(() => props.value.toLocaleString('en-US'))
</script>

<template>
  <div ref="el" class="card px-4 py-5 text-center">
    <p aria-hidden="true" class="text-3xl font-bold tracking-tight text-primary tabular-nums sm:text-4xl">{{ shown }}</p>
    <p class="mt-1 text-xs text-muted sm:text-sm"><span class="sr-only">{{ final }} </span>{{ label }}</p>
  </div>
</template>
```

`src/components/StatsStrip.vue`
```vue
<script setup lang="ts">
import type { Stat } from '../content/types'
import StatNumber from './StatNumber.vue'

defineProps<{ stats: Stat[] }>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-4" :class="stats.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'">
    <StatNumber v-for="s in stats" :key="s.label" :value="s.value" :label="s.label" />
  </div>
</template>
```

`src/components/ProjectCard.vue`
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Project } from '../content/types'
import { CATEGORY_LABELS } from '../content/queries'
import { useTilt } from '../composables/useTilt'

const props = defineProps<{ project: Project }>()
const card = ref<HTMLElement | null>(null)
useTilt(card)
const cover = computed(() => props.project.images[0])
const coverFailed = ref(false)
</script>

<template>
  <article
    ref="card"
    class="card relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:shadow-[0_18px_40px_-18px_rgb(126_34_206/0.45)] motion-reduce:transition-none"
  >
    <div class="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-soft to-[#fce7f3]">
      <img
        v-if="cover && !coverFailed"
        :src="cover.src"
        alt=""
        :width="cover.width"
        :height="cover.height"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover object-top"
        @error="coverFailed = true"
      />
    </div>
    <div class="flex flex-1 flex-col p-5">
      <p class="eyebrow">{{ CATEGORY_LABELS[project.category] }}</p>
      <h3 class="mt-2 text-lg leading-snug font-semibold">
        <RouterLink :to="`/projects/${project.slug}`" class="after:absolute after:inset-0">{{ project.title }}</RouterLink>
      </h3>
      <p class="mt-2 flex-1 text-sm text-muted">{{ project.summary }}</p>
      <p class="mt-4 text-xs text-muted">{{ project.team }}</p>
    </div>
  </article>
</template>
```

`src/components/ProjectFilter.vue`
```vue
<script setup lang="ts">
import { CATEGORY_LABELS, CATEGORY_ORDER, type Filter } from '../content/queries'

defineProps<{ counts: Record<Filter, number> }>()
const model = defineModel<Filter>({ required: true })
const options: Filter[] = ['all', ...CATEGORY_ORDER]
const label = (f: Filter) => (f === 'all' ? 'All' : CATEGORY_LABELS[f])
</script>

<template>
  <div role="group" aria-label="Filter projects by area" class="flex flex-wrap gap-2">
    <button
      v-for="f in options"
      :key="f"
      type="button"
      :aria-pressed="model === f"
      class="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
      :class="model === f ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-primary-ink hover:border-primary'"
      @click="model = f"
    >{{ label(f) }} <span class="opacity-70">{{ counts[f] }}</span></button>
  </div>
</template>
```

The button text must render as `All 11`, with exactly one space between the label and the count, so the test's `toEqual(['All 11'])` matches. Keep the button content on one line, as shown above.

`src/components/SkillsSection.vue`
```vue
<script setup lang="ts">
import type { SkillGroup } from '../content/types'
import RevealItem from './RevealItem.vue'

defineProps<{ groups: SkillGroup[] }>()
</script>

<template>
  <section class="section" aria-labelledby="skills-title">
    <h2 id="skills-title" class="section-title">Skills &amp; tools</h2>
    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RevealItem v-for="(g, i) in groups" :key="g.group" :index="i">
        <div class="card h-full p-5">
          <h3 class="font-semibold">{{ g.group }}</h3>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li v-for="s in g.items" :key="s" class="chip">{{ s }}</li>
          </ul>
        </div>
      </RevealItem>
    </div>
  </section>
</template>
```

`src/components/CertificatesSection.vue`
```vue
<script setup lang="ts">
import type { Certificate } from '../content/types'
import RevealItem from './RevealItem.vue'

defineProps<{ certificates: Certificate[] }>()
</script>

<template>
  <section class="section" aria-labelledby="certificates-title">
    <h2 id="certificates-title" class="section-title">Certificates</h2>
    <ul class="mt-8 grid gap-4 sm:grid-cols-2">
      <li v-for="(c, i) in certificates" :key="c.name">
        <RevealItem :index="i">
          <div class="card h-full p-5">
            <p class="eyebrow">{{ c.issuer }}</p>
            <p class="mt-2 font-semibold">{{ c.name }}</p>
            <p class="mt-1 text-sm text-muted">{{ c.date }}</p>
          </div>
        </RevealItem>
      </li>
    </ul>
  </section>
</template>
```

`src/components/ContactSection.vue`
```vue
<script setup lang="ts">
import type { Contact } from '../content/types'

defineProps<{ contact: Contact; cvUrl?: string }>()
</script>

<template>
  <section class="section" aria-labelledby="contact-title">
    <div class="card bg-gradient-to-br from-surface to-bg-2 p-8 text-center sm:p-12">
      <h2 id="contact-title" class="section-title">Let's talk</h2>
      <p class="mx-auto mt-3 max-w-md text-muted">Interested in data, BI, QA, or database work? I'd like to hear from you.</p>
      <ul class="mt-8 flex flex-wrap justify-center gap-3">
        <li v-if="contact.email"><a :href="`mailto:${contact.email}`" class="btn-primary">Email me</a></li>
        <li v-if="contact.linkedin">
          <a :href="contact.linkedin" target="_blank" rel="noopener noreferrer" class="btn-secondary">LinkedIn <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span></a>
        </li>
        <li v-if="contact.github">
          <a :href="contact.github" target="_blank" rel="noopener noreferrer" class="btn-secondary">GitHub <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span></a>
        </li>
        <li v-if="cvUrl"><a :href="cvUrl" download class="btn-secondary">Download CV</a></li>
      </ul>
    </div>
  </section>
</template>
```

`src/pages/HomePage.vue`
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { projects } from '../content/projects'
import { site } from '../content/site'
import { countByFilter, featuredProjects, filterProjects, hasContact, type Filter } from '../content/queries'
import { canonical, pageMeta } from '../content/meta'
import HeroSection from '../components/HeroSection.vue'
import StatsStrip from '../components/StatsStrip.vue'
import ProjectCard from '../components/ProjectCard.vue'
import ProjectFilter from '../components/ProjectFilter.vue'
import RevealItem from '../components/RevealItem.vue'
import SkillsSection from '../components/SkillsSection.vue'
import CertificatesSection from '../components/CertificatesSection.vue'
import ContactSection from '../components/ContactSection.vue'

const filter = ref<Filter>('all')
const visible = computed(() => filterProjects(projects, filter.value))
const counts = countByFilter(projects)
const featured = featuredProjects(projects)

useHead({
  link: [{ rel: 'canonical', href: canonical('/') }],
  meta: pageMeta({
    title: `${site.name} — ${site.roles[0]}`,
    description: site.intro,
    path: '/',
    image: '/og/home.png',
  }),
})
</script>

<template>
  <HeroSection />

  <section class="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Highlights">
    <StatsStrip :stats="site.stats" />
  </section>

  <section id="featured" class="section" aria-labelledby="featured-title">
    <h2 id="featured-title" class="section-title">Featured work</h2>
    <div class="mt-8 grid gap-6 md:grid-cols-3">
      <RevealItem v-for="(p, i) in featured" :key="p.slug" :index="i">
        <ProjectCard :project="p" />
      </RevealItem>
    </div>
  </section>

  <section id="work" class="section" aria-labelledby="work-title">
    <h2 id="work-title" class="section-title">All projects</h2>
    <p class="mt-2 text-muted">Group projects list only the parts I did myself.</p>
    <ProjectFilter v-model="filter" :counts="counts" class="mt-6" />
    <p class="sr-only" aria-live="polite">Showing {{ visible.length }} projects</p>
    <TransitionGroup tag="ul" name="grid" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="p in visible" :key="p.slug">
        <ProjectCard :project="p" />
      </li>
    </TransitionGroup>
  </section>

  <SkillsSection id="skills" :groups="site.skills" />
  <CertificatesSection id="certificates" :certificates="site.certificates" />
  <ContactSection v-if="hasContact(site.contact)" id="contact" :contact="site.contact" :cv-url="site.cvUrl" />
</template>
```

Replace `src/App.vue`:
```vue
<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { site } from './content/site'
import AppNav from './components/AppNav.vue'
import AppFooter from './components/AppFooter.vue'

useHead({
  htmlAttrs: { lang: 'en' },
  titleTemplate: (title?: string) => (title ? `${title} · ${site.name}` : `${site.name} — ${site.roles[0]}`),
})
</script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <AppNav />
  <main id="main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
</template>
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/unit/home.test.ts`
Expected: all pass. The leave transition can keep old `<li>` items in the DOM for a moment in the filter test. `TransitionGroup` in `@vue/test-utils` is stubbed by default (`global.stubs.transition-group` = true), so items leave at once. If the count is still wrong, add `await new Promise((r) => setTimeout(r, 300))` before the assertion. Do not change the component.

- [ ] **Step 5: Look at it**

Run: `npm run dev`, then open the printed URL. Check:
- The hero, stats, featured cards, grid, filter, skills, and certificates are there.
- There is no contact section.
- Cards tilt with the mouse.
- The stats count up.

Stop the server.

- [ ] **Step 6: Full test, typecheck, lint, commit**

```bash
npm test && npm run typecheck && npm run lint
git add -A
git commit -m "feat: build home page with hero, stats, project grid, and filter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Project detail page, gallery, lightbox, 404

**Files:**
- Create: `src/components/ProjectDetail.vue`, `ScreenshotGallery.vue`, `ImageLightbox.vue`, `ProjectNav.vue`
- Modify: `src/pages/ProjectPage.vue`, `src/pages/NotFoundPage.vue`, `src/styles.css` (append the gallery and lightbox styles)
- Test: `tests/unit/project.test.ts`

**Interfaces:**
- Consumes: `getProject`, `neighbours`, `CATEGORY_LABELS` (Task 2), `pageMeta`, `canonical` (Task 2), `StatsStrip` (Task 4), `motionAllowed` (Task 3), and `mountWithApp` (Task 4).
- Produces: `ProjectDetail { project: Project; prev?: Project; next?: Project }`, `ScreenshotGallery { images: ProjectImage[] }` emits `open(index: number)`, `ImageLightbox { images: ProjectImage[] }` with `v-model:index: number | null`, and `ProjectNav { prev?: Project; next?: Project }`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/project.test.ts`
```ts
import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithApp } from './helpers'
import ProjectPage from '../../src/pages/ProjectPage.vue'
import ProjectDetail from '../../src/components/ProjectDetail.vue'
import ScreenshotGallery from '../../src/components/ScreenshotGallery.vue'
import ImageLightbox from '../../src/components/ImageLightbox.vue'
import type { Project, ProjectImage } from '../../src/content/types'

afterEach(() => {
  document.body.innerHTML = ''
})

const images: ProjectImage[] = [
  { src: '/a.webp', alt: 'First screen', width: 1600, height: 1000 },
  { src: '/b.webp', alt: 'Second screen', width: 1600, height: 1000 },
]

const minimal: Project = {
  slug: 'minimal',
  title: 'Minimal project',
  category: 'qa',
  course: 'Course',
  team: 'Individual',
  tools: ['Tool'],
  summary: 'Summary',
  overview: 'Overview text',
  contributions: ['Did one thing'],
  images: [],
}

describe('ProjectPage', () => {
  it('renders a real project by slug', async () => {
    const w = await mountWithApp(ProjectPage, { slug: 'snapcash-pos' }, '/projects/snapcash-pos')
    expect(w.find('h1').text()).toBe('SnapCash POS — Project Plan')
    expect(w.text()).toContain('My contribution')
  })
  it('renders the 404 content for an unknown slug', async () => {
    const w = await mountWithApp(ProjectPage, { slug: 'does-not-exist' }, '/projects/does-not-exist')
    expect(w.find('h1').text()).toBe('This page does not exist')
    expect(w.find('a[href="/"]').exists()).toBe(true)
  })
})

describe('ProjectDetail', () => {
  it('renders a project with no images, links, stats, term, or role without empty sections', async () => {
    const w = await mountWithApp(ProjectDetail, { project: minimal })
    expect(w.find('h1').text()).toBe('Minimal project')
    expect(w.text()).toContain('Did one thing')
    expect(w.text()).not.toContain('Gallery')
    expect(w.text()).not.toContain('Key numbers')
    expect(w.findAll('a[target="_blank"]')).toHaveLength(0)
    expect(w.find('nav[aria-label="More projects"]').findAll('a')).toHaveLength(0)
  })
  it('opens external links in a new tab safely', async () => {
    const w = await mountWithApp(ProjectDetail, {
      project: { ...minimal, links: [{ label: 'Live', href: 'https://example.com' }] },
    })
    const a = w.find('a[href="https://example.com"]')
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
  })
})

describe('ScreenshotGallery', () => {
  it('emits open with the image index', async () => {
    const w = await mountWithApp(ScreenshotGallery, { images })
    await w.findAll('figure button')[1]!.trigger('click')
    expect(w.emitted('open')).toEqual([[1]])
  })
  it('shows the alt text when an image fails to load', async () => {
    const w = await mountWithApp(ScreenshotGallery, { images })
    await w.findAll('img')[0]!.trigger('error')
    expect(w.findAll('figure')[0]!.text()).toContain('First screen')
    expect(w.findAll('figure')[0]!.find('img').exists()).toBe(false)
  })
})

describe('ImageLightbox', () => {
  it('opens on index, steps with arrow keys, and returns focus to the opener on close', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const w = await mountWithApp(ImageLightbox, { images, index: null, 'onUpdate:index': (v: number | null) => w.setProps({ index: v }) })
    await w.setProps({ index: 0 })
    const dialog = w.find('dialog')
    expect(dialog.attributes('open')).toBeDefined()
    expect(w.text()).toContain('1 / 2')

    await dialog.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises() // the emitted update:index → setProps → re-render
    expect(w.text()).toContain('2 / 2')
    await dialog.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(w.text()).toContain('1 / 2') // wraps around

    ;(dialog.element as HTMLDialogElement).close() // what Esc does in a real browser
    await flushPromises()
    expect(w.props('index')).toBeNull()
    expect(document.activeElement).toBe(opener)
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/unit/project.test.ts`
Expected: FAIL — missing components, and the temporary `ProjectPage` has no content.

- [ ] **Step 3: Implement**

`src/components/ProjectNav.vue`
```vue
<script setup lang="ts">
import type { Project } from '../content/types'

defineProps<{ prev?: Project; next?: Project }>()
</script>

<template>
  <nav aria-label="More projects" class="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
    <RouterLink v-if="prev" :to="`/projects/${prev.slug}`" class="card p-5 transition-colors hover:border-primary">
      <span class="text-xs text-muted">← Previous</span>
      <span class="mt-1 block font-semibold">{{ prev.title }}</span>
    </RouterLink>
    <RouterLink v-if="next" :to="`/projects/${next.slug}`" class="card p-5 text-right transition-colors hover:border-primary sm:col-start-2">
      <span class="text-xs text-muted">Next →</span>
      <span class="mt-1 block font-semibold">{{ next.title }}</span>
    </RouterLink>
  </nav>
</template>
```

`src/components/ScreenshotGallery.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectImage } from '../content/types'
import { motionAllowed } from '../composables/motion'

defineProps<{ images: ProjectImage[] }>()
const emit = defineEmits<{ open: [index: number] }>()

const track = ref<HTMLElement | null>(null)
const failed = ref<Set<number>>(new Set())
const dragging = ref(false)
let drag: { x: number; left: number; moved: boolean } | null = null
let suppressClick = false

function scrollByPage(dir: 1 | -1) {
  const t = track.value
  if (!t) return
  t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: motionAllowed() ? 'smooth' : 'auto' })
}

// Mouse drag-to-scroll. Touch and trackpad use native scrolling.
function onPointerDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !track.value) return
  drag = { x: e.clientX, left: track.value.scrollLeft, moved: false }
}
function onPointerMove(e: PointerEvent) {
  if (!drag || !track.value) return
  const dx = e.clientX - drag.x
  if (Math.abs(dx) > 5) {
    drag.moved = true
    dragging.value = true
  }
  track.value.scrollLeft = drag.left - dx
}
function onPointerUp() {
  if (drag?.moved) suppressClick = true
  drag = null
  dragging.value = false
}
function open(i: number) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  emit('open', i)
}
function markFailed(i: number) {
  failed.value = new Set(failed.value).add(i)
}
</script>

<template>
  <div>
    <div
      ref="track"
      class="gallery flex gap-4 overflow-x-auto pb-4"
      :class="dragging ? 'cursor-grabbing snap-none' : 'snap-x snap-mandatory'"
      tabindex="0"
      role="region"
      aria-label="Screenshots, scroll sideways"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <figure v-for="(img, i) in images" :key="img.src" class="w-[85%] flex-none snap-start sm:w-[60%] lg:w-[45%]">
        <button
          type="button"
          class="block w-full overflow-hidden rounded-xl border border-line bg-surface"
          :aria-label="`Open image ${i + 1} of ${images.length}: ${img.alt}`"
          @click="open(i)"
        >
          <img
            v-if="!failed.has(i)"
            :src="img.src"
            :alt="img.alt"
            :width="img.width"
            :height="img.height"
            loading="lazy"
            decoding="async"
            draggable="false"
            class="aspect-[16/10] w-full object-cover object-top"
            @error="markFailed(i)"
          />
          <span v-else class="flex aspect-[16/10] w-full items-center justify-center bg-primary-soft p-4 text-sm text-muted">{{ img.alt }}</span>
        </button>
        <figcaption v-if="img.caption" class="mt-2 text-sm text-muted">{{ img.caption }}</figcaption>
      </figure>
    </div>
    <div v-if="images.length > 1" class="mt-2 flex justify-end gap-2">
      <button type="button" class="btn-secondary px-3 py-2" aria-label="Scroll screenshots left" @click="scrollByPage(-1)">←</button>
      <button type="button" class="btn-secondary px-3 py-2" aria-label="Scroll screenshots right" @click="scrollByPage(1)">→</button>
    </div>
  </div>
</template>
```

`src/components/ImageLightbox.vue`
```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProjectImage } from '../content/types'

const props = defineProps<{ images: ProjectImage[] }>()
const index = defineModel<number | null>('index', { required: true })

const dialog = ref<HTMLDialogElement | null>(null)
const current = computed(() => (index.value === null ? undefined : props.images[index.value]))
let opener: HTMLElement | null = null

watch(index, (i, prev) => {
  const d = dialog.value
  if (!d) return
  if (i !== null && prev === null && !d.open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    d.showModal()
  }
  if (i === null && d.open) d.close()
})

function onClose() {
  index.value = null
  opener?.focus()
  opener = null
}
function step(dir: 1 | -1) {
  if (index.value === null) return
  const n = props.images.length
  index.value = (index.value + dir + n) % n
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
</script>

<template>
  <dialog ref="dialog" class="lightbox" aria-label="Image viewer" @close="onClose" @keydown="onKey">
    <figure v-if="current" class="flex h-full flex-col items-center justify-center gap-3 p-4 sm:p-10" @click.self="dialog?.close()">
      <img :src="current.src" :alt="current.alt" :width="current.width" :height="current.height" class="max-h-[80vh] w-auto max-w-full rounded-lg object-contain" />
      <figcaption class="text-center text-sm text-white/80">{{ current.caption ?? current.alt }} · {{ (index ?? 0) + 1 }} / {{ images.length }}</figcaption>
    </figure>
    <button type="button" class="lightbox-btn top-4 right-4" aria-label="Close image viewer" @click="dialog?.close()">✕</button>
    <template v-if="images.length > 1">
      <button type="button" class="lightbox-btn top-1/2 left-4 -translate-y-1/2" aria-label="Previous image" @click="step(-1)">←</button>
      <button type="button" class="lightbox-btn top-1/2 right-4 -translate-y-1/2" aria-label="Next image" @click="step(1)">→</button>
    </template>
  </dialog>
</template>
```

`src/components/ProjectDetail.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Project } from '../content/types'
import { CATEGORY_LABELS } from '../content/queries'
import StatsStrip from './StatsStrip.vue'
import ScreenshotGallery from './ScreenshotGallery.vue'
import ImageLightbox from './ImageLightbox.vue'
import ProjectNav from './ProjectNav.vue'

defineProps<{ project: Project; prev?: Project; next?: Project }>()
const lightboxIndex = ref<number | null>(null)
</script>

<template>
  <article class="section">
    <RouterLink to="/#work" class="text-sm font-medium text-primary hover:underline">← All projects</RouterLink>

    <header class="mt-6">
      <p class="eyebrow">{{ CATEGORY_LABELS[project.category] }}</p>
      <h1 class="mt-2 max-w-4xl text-3xl font-bold tracking-tight break-words sm:text-5xl">{{ project.title }}</h1>
      <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        <div><dt class="sr-only">Team</dt><dd>{{ project.team }}</dd></div>
        <div><dt class="sr-only">Course</dt><dd>{{ project.course }}</dd></div>
        <div v-if="project.term"><dt class="sr-only">Term</dt><dd>{{ project.term }}</dd></div>
        <div v-if="project.role"><dt class="sr-only">Role</dt><dd>{{ project.role }}</dd></div>
      </dl>
      <ul class="mt-4 flex flex-wrap gap-2" aria-label="Tools">
        <li v-for="t in project.tools" :key="t" class="chip">{{ t }}</li>
      </ul>
      <ul v-if="project.links?.length" class="mt-6 flex flex-wrap gap-3">
        <li v-for="(l, i) in project.links" :key="l.href">
          <a :href="l.href" target="_blank" rel="noopener noreferrer" :class="i === 0 ? 'btn-primary' : 'btn-secondary'">
            {{ l.label }} <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </header>

    <section class="mt-12 max-w-3xl" aria-labelledby="overview-title">
      <h2 id="overview-title" class="text-xl font-bold tracking-tight sm:text-2xl">Overview</h2>
      <p class="mt-3 leading-relaxed text-muted">{{ project.overview }}</p>
    </section>

    <section class="mt-10 max-w-3xl" aria-labelledby="contribution-title">
      <h2 id="contribution-title" class="text-xl font-bold tracking-tight sm:text-2xl">My contribution</h2>
      <ul class="mt-4 space-y-3">
        <li v-for="c in project.contributions" :key="c" class="flex gap-3">
          <span aria-hidden="true" class="mt-2 h-2 w-2 flex-none rounded-full bg-accent"></span>
          <span class="leading-relaxed">{{ c }}</span>
        </li>
      </ul>
    </section>

    <section v-if="project.images.length" class="mt-12" aria-labelledby="gallery-title">
      <h2 id="gallery-title" class="text-xl font-bold tracking-tight sm:text-2xl">Gallery</h2>
      <ScreenshotGallery class="mt-4" :images="project.images" @open="lightboxIndex = $event" />
      <ImageLightbox v-model:index="lightboxIndex" :images="project.images" />
    </section>

    <section v-if="project.stats?.length" class="mt-12" aria-labelledby="numbers-title">
      <h2 id="numbers-title" class="text-xl font-bold tracking-tight sm:text-2xl">Key numbers</h2>
      <StatsStrip class="mt-4" :stats="project.stats" />
    </section>

    <ProjectNav class="mt-16" :prev="prev" :next="next" />
  </article>
</template>
```

Replace `src/pages/ProjectPage.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { getProject, neighbours } from '../content/queries'
import { canonical, pageMeta } from '../content/meta'
import { site } from '../content/site'
import ProjectDetail from '../components/ProjectDetail.vue'
import NotFoundPage from './NotFoundPage.vue'

const props = defineProps<{ slug: string }>()
const project = computed(() => getProject(props.slug))
const nav = computed(() => neighbours(props.slug))

useHead(() => {
  const p = project.value
  if (!p) return {}
  return {
    title: p.title,
    link: [{ rel: 'canonical', href: canonical(`/projects/${p.slug}`) }],
    meta: pageMeta({
      title: `${p.title} · ${site.name}`,
      description: p.summary,
      path: `/projects/${p.slug}`,
      image: `/og/${p.slug}.png`,
    }),
  }
})
</script>

<template>
  <ProjectDetail v-if="project" :project="project" :prev="nav.prev" :next="nav.next" />
  <NotFoundPage v-else />
</template>
```

Replace `src/pages/NotFoundPage.vue`:
```vue
<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({ title: 'Page not found', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <section class="section text-center">
    <p class="eyebrow">404</p>
    <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">This page does not exist</h1>
    <p class="mt-4 text-muted">The link may be old or mistyped.</p>
    <RouterLink to="/" class="btn-primary mt-8">Back to home</RouterLink>
  </section>
</template>
```

Append to `src/styles.css`:
```css
.gallery {
  scrollbar-width: thin;
  scrollbar-color: var(--color-line) transparent;
}

.lightbox {
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: rgb(20 12 32 / 0.92);
}
.lightbox::backdrop {
  background: transparent;
}
.lightbox-btn {
  position: absolute;
  @apply grid h-11 w-11 place-items-center rounded-full bg-white/10 text-lg text-white hover:bg-white/20;
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/unit/project.test.ts`
Expected: all pass.

- [ ] **Step 5: Full test, typecheck, lint, commit**

```bash
npm test && npm run typecheck && npm run lint
git add -A
git commit -m "feat: add project detail page with gallery, lightbox, and 404

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Static generation of every route, and build checks

**Files:**
- Modify: `vite.config.ts`
- Create: `vitest.build.config.ts`, `tests/build/dist.test.ts`

**Interfaces:**
- Consumes: `projects` (Task 2), `scripts/postbuild.ts` (Task 1).
- Produces: `dist/index.html`, `dist/projects/<slug>/index.html` for all 11 slugs, `dist/404.html`.

- [ ] **Step 1: Write the failing build test**

`vitest.build.config.ts`
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'node', include: ['tests/build/**/*.test.ts'] },
})
```

`tests/build/dist.test.ts`
```ts
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { projects } from '../../src/content/projects'

const dist = resolve(import.meta.dirname, '../../dist')
const read = (p: string) => readFileSync(resolve(dist, p), 'utf8')
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ogTitle = (html: string) => html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/)?.[1]

describe('dist', () => {
  it('pre-renders the home page with real content and final stat numbers', () => {
    const html = read('index.html')
    expect(html).toMatch(/<title>Meini Rusiadi — Data (&amp;|&) BI Analyst<\/title>/)
    expect(html).toContain('clear decisions')
    expect(html).toContain('2,125')
    expect(html).toContain(`>${projects.length}<`)
  })

  it.each(projects.map((p) => [p.slug, p] as const))('pre-renders /projects/%s with its own title and og:title', (slug, p) => {
    const file = `projects/${slug}/index.html`
    expect(existsSync(resolve(dist, file))).toBe(true)
    const html = read(file)
    expect(html).toContain(`<title>${escape(p.title)} · Meini Rusiadi</title>`)
    expect(ogTitle(html)).toBe(escape(`${p.title} · Meini Rusiadi`))
    expect(html).toContain(escape(p.contributions[0]!))
  })

  it('gives every page a unique og:title', () => {
    const titles = ['index.html', ...projects.map((p) => `projects/${p.slug}/index.html`)].map((f) => ogTitle(read(f)))
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('writes a 404.html for the static host', () => {
    expect(read('404.html')).toContain('This page does not exist')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vite-ssg build; npm run test:build`
Expected: FAIL. Project pages and `404.html` are missing, because dynamic routes are not rendered yet.

- [ ] **Step 3: Configure `includedRoutes`**

Replace `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'
import { projects } from './src/content/projects'

const ssgOptions: ViteSSGOptions = {
  dirStyle: 'nested',
  formatting: 'none',
  // Static paths come from the route table; dynamic ones (with ':') are replaced by
  // one path per project. '/404' renders the catch-all route for dist/404.html.
  includedRoutes(paths) {
    const staticPaths = paths.filter((p) => !p.includes(':'))
    return [...staticPaths, ...projects.map((p) => `/projects/${p.slug}`), '/404']
  },
}

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ssgOptions,
})
```

- [ ] **Step 4: Build and run the build tests**

Run: `npm run build && npm run test:build`
Expected:
- The build prints `postbuild: wrote dist/404.html`.
- All build tests pass.

If the `>11<` assertion fails, open `dist/index.html` and check how the stat number is rendered. It must be the final number, not `0`. `useCountUp` only resets after mount, so SSR shows the final value.

- [ ] **Step 5: Privacy check on the build**

Run: `npm run privacy`
Expected: `files clean`.

- [ ] **Step 6: Typecheck, lint, commit**

```bash
npm run typecheck && npm run lint
git add -A
git commit -m "feat: pre-render every project page and 404 with vite-ssg

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Images and Open Graph cards

**Files:**
- Create: `scripts/extract-images.ts`, `scripts/pdf-to-png.swift`, `scripts/image-manifest.json`, `scripts/optimize-images.ts`, `scripts/make-og.ts`
- Generate: `public/projects/<slug>/*.webp`, `src/content/images.generated.ts`, `public/og/*.png`
- Modify: `tests/unit/content.test.ts` (add the OG test)

**Interfaces:**
- Consumes: `projects` (Task 2), the source folders in `/Users/karvin/meini/` (read-only).
- Produces: `projectImages` entries `{ src: '/projects/<slug>/<nn>.webp', alt, caption?, width, height }`, and `public/og/home.png` + `public/og/<slug>.png` (1200×630).

- [ ] **Step 1: Write the extraction scripts**

`scripts/pdf-to-png.swift`
```swift
// Renders every page of a PDF to PNG at 2x. Usage: swift pdf-to-png.swift <in.pdf> <outdir>
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count == 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
    FileHandle.standardError.write("usage: pdf-to-png <in.pdf> <outdir>\n".data(using: .utf8)!)
    exit(1)
}
let outDir = URL(fileURLWithPath: args[2])
for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let image = page.thumbnail(of: NSSize(width: box.width * 2, height: box.height * 2), for: .mediaBox)
    guard let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { continue }
    try png.write(to: outDir.appendingPathComponent(String(format: "page-%03d.png", i + 1)))
}
```

`scripts/extract-images.ts`
```ts
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
    execFileSync('unzip', ['-j', '-o', '-q', src, 'word/media/*', '-d', out])
  }
  console.log(`${slug}: ${readdirSync(out).length} files`)
}
```

- [ ] **Step 2: Run the extraction**

Run: `npm run images:extract`
Expected: one line per slug, each with a file count greater than 0. It fails loudly if a folder pattern matches 0 or 2+ files.

- [ ] **Step 3: Curate. This is a human-judgement step, done by the executor while looking at every image**

Open each extracted image with the Read tool. Choose 2–5 images per project that show **only Meini's claimed parts**:

| slug | Pick from |
|---|---|
| google-ads-dashboard | final dashboard, heatmap, scatter plot, dual-axis trend (PDF pages) |
| ai-acceptance-research | research model figure, inner model figure |
| budgetwise-finance-dashboard | final dashboard screenshots (PDF pages 12–13) |
| ecommerce-order-analysis | cleaning-step results, named-range helper sheet |
| shoe-factory-database | query/result screenshots from her SRF, JOIN, and aggregate sections. **Not the ERD** |
| soundease-database | results of queries 8 and 9. **Not query 10** |
| livetix-testing | prototype screens (if any), test case table |
| snapcash-pos | critical path diagram (PDF page 32) |
| stsport-booking-system | fishbone, context diagram, use case, class diagram, state transition, one activity diagram |
| tix-id-redesign | persona, user journey, redesigned Home / footer / checkout screens |
| edupal-ai-teacher | prototype screens: sign-up, home, Ask AI, assignments |

Reject any image that shows a student ID, a `@binus.ac.id` email, or a person's name. If an image needs only a crop to remove such text, use `crop`. Skip `.emf` / `.wmf` files.

Write every pick into `scripts/image-manifest.json`, using this shape (the entry below is a format example; replace it with real picks):

```json
[
  {
    "slug": "google-ads-dashboard",
    "source": "page-015.png",
    "out": "01",
    "alt": "Final Tableau dashboard with device filter, heatmap, scatter plot, and trend line",
    "caption": "Final dashboard",
    "crop": { "left": 80, "top": 120, "width": 1030, "height": 700 }
  }
]
```

`crop` is optional and is in source pixels. `out` is the two-digit order within the project. The first entry per slug becomes the card cover.

- [ ] **Step 4: Write `scripts/optimize-images.ts`**

```ts
// Reads scripts/image-manifest.json, writes public/projects/<slug>/<out>.webp,
// and regenerates src/content/images.generated.ts with real sizes.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

interface Entry {
  slug: string
  source: string
  out: string
  alt: string
  caption?: string
  crop?: { left: number; top: number; width: number; height: number }
}

const root = resolve(import.meta.dirname, '..')
const manifest: Entry[] = JSON.parse(readFileSync(join(root, 'scripts/image-manifest.json'), 'utf8'))
const bySlug: Record<string, Array<{ src: string; alt: string; caption?: string; width: number; height: number }>> = {}

rmSync(join(root, 'public/projects'), { recursive: true, force: true })
for (const e of manifest) {
  const input = join(root, '.work/extracted', e.slug, e.source)
  const dir = join(root, 'public/projects', e.slug)
  mkdirSync(dir, { recursive: true })
  let img = sharp(input)
  if (e.crop) img = img.extract(e.crop)
  const info = await img
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(dir, `${e.out}.webp`))
  ;(bySlug[e.slug] ??= []).push({
    src: `/projects/${e.slug}/${e.out}.webp`,
    alt: e.alt,
    ...(e.caption ? { caption: e.caption } : {}),
    width: info.width,
    height: info.height,
  })
}
for (const list of Object.values(bySlug)) list.sort((a, b) => a.src.localeCompare(b.src))

const body = `// Generated by scripts/optimize-images.ts — do not edit by hand.
import type { ProjectImage } from './types'

export const projectImages: Record<string, ProjectImage[]> = ${JSON.stringify(bySlug, null, 2)}
`
writeFileSync(join(root, 'src/content/images.generated.ts'), body)
console.log(`optimize-images: ${manifest.length} images for ${Object.keys(bySlug).length} projects`)
```

- [ ] **Step 5: Run it and check the content tests**

Run: `npm run images:optimize && npm test`
Expected: the script prints the counts. The content test "points every image at a file that exists…" now checks real files and passes.

- [ ] **Step 6: Add the failing OG test**

Add to `tests/unit/content.test.ts` inside `describe('projects content', …)`:
```ts
  it('has an Open Graph image for the home page and every project', () => {
    expect(existsSync(resolve(publicDir, 'og/home.png'))).toBe(true)
    for (const p of projects) expect(existsSync(resolve(publicDir, `og/${p.slug}.png`)), p.slug).toBe(true)
  })
```

Run: `npx vitest run tests/unit/content.test.ts`
Expected: FAIL — `og/home.png` is missing.

- [ ] **Step 7: Write `scripts/make-og.ts`**

```ts
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
    <filter id="blur"><feGaussianBlur stdDeviation="60"/></filter>
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
```

- [ ] **Step 8: Generate the cards and check**

Run: `npm run og && npx vitest run tests/unit/content.test.ts`
Expected: `make-og: 12 cards`, and the tests pass. Open `public/og/home.png` and one project card with the Read tool. Check that the text is readable and not cut off.

- [ ] **Step 9: Visual check, full tests, commit**

Run `npm run dev` and look at 3 project pages. Check:
- The cover images crop well.
- The gallery swipes.
- The lightbox works.

Then:
```bash
npm test && npm run typecheck && npm run lint && npm run build && npm run test:build && npm run privacy
git add -A
git commit -m "feat: add curated project screenshots and Open Graph cards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: External links

**Files:**
- Create: `scripts/check-links.ts`
- Modify: `src/content/projects.ts` (Figma / Drive links, after confirmation)

**Interfaces:**
- Consumes: `projects` (Task 2).
- Produces: `npm run links`. It prints one status line per link and exits 1 if any link is broken.

- [ ] **Step 1: Write the link checker**

`scripts/check-links.ts`
```ts
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
```

- [ ] **Step 2: Run it on the current links**

Run: `npm run links`
Expected: Tableau, YouTube, and Zenodo print `ok`. If one fails, remove that link from `projects.ts` and tell Karvin which one.

- [ ] **Step 3: Ask Karvin to confirm the Figma and Drive links are view-only**

A GET cannot tell whether a Figma or Drive file is view-only. Ask Karvin (or Meini) to open each link below in a **private browser window, logged out**. A link passes only if the file opens, and there is no edit access or login wall.

| slug | Label | URL |
|---|---|---|
| tix-id-redesign | Figma prototype | `https://www.figma.com/design/UVW1aiBmklDlm0Bv7fvkhK/Projek-UI%2FUX?node-id=0-1` |
| stsport-booking-system | Figma prototype | `https://www.figma.com/proto/39bvWBqdMTAVBXI4rPw6ZF/StSport?node-id=2008-1334&starting-point-node-id=2008%3A1332` |
| livetix-testing | Figma prototype | `https://www.figma.com/design/mWHzUu6NFPFFfrrhh5Eq4Y/TSI?node-id=0-1` |
| edupal-ai-teacher | Figma prototype | `https://www.figma.com/design/g65e3miNjpeSGlNZLMs5dE/Untitled?node-id=0-1` |
| edupal-ai-teacher | Prototype video | `https://drive.google.com/file/d/1ZzXqV3XrWFFSDK6ct0jAVn6BwHmGhk6F/view` |

Wait for the answer.

- [ ] **Step 4: Add only the confirmed links**

For each confirmed link, add it to that project's `links` array in `src/content/projects.ts`. For example:
```ts
    links: [{ label: 'Figma prototype', href: 'https://www.figma.com/design/UVW1aiBmklDlm0Bv7fvkhK/Projek-UI%2FUX?node-id=0-1' }],
```
Links that are not confirmed are left out. Record them in spec §13 as a new open item.

- [ ] **Step 5: Re-run, test, commit**

```bash
npm run links && npm test
git add -A
git commit -m "feat: add verified external project links

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: End-to-end tests, full check, manual review

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/site.spec.ts`

**Interfaces:**
- Consumes: the built site in `dist/` (Task 6), served by `npm run preview` on port 4173.

- [ ] **Step 1: Install the browser for Playwright**

Playwright drives a real Chromium to click through the built site. This command downloads Chromium (about 150 MB) into `~/Library/Caches/ms-playwright`. It does not touch the system Chrome.

Run: `npx playwright install chromium`
Expected: download finishes.

- [ ] **Step 2: Write the config and tests**

`playwright.config.ts`
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
```

`tests/e2e/site.spec.ts`
```ts
import { expect, test, type Page } from '@playwright/test'

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || /hydration/i.test(m.text())) errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

test('home renders hero and all projects without console errors', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('clear decisions')
  await expect(page.locator('#work li')).toHaveCount(11)
  expect(errors).toEqual([])
})

test('filter shows only QA projects', async ({ page }) => {
  await page.goto('/')
  const qa = page.locator('#work').getByRole('button', { name: /^QA/ })
  await qa.click()
  await expect(qa).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#work li')).toHaveCount(1)
  await expect(page.locator('#work li')).toContainText('LiveTix')
})

test('a project card opens its detail page', async ({ page }) => {
  await page.goto('/')
  await page.locator('#featured').getByRole('link', { name: 'Google Ads Campaign Performance Dashboard' }).click()
  await expect(page).toHaveURL(/\/projects\/google-ads-dashboard\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Google Ads Campaign Performance Dashboard')
})

test('detail page loads directly, with and without a trailing slash', async ({ page }) => {
  const errors = collectErrors(page)
  for (const path of ['/projects/snapcash-pos', '/projects/snapcash-pos/']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SnapCash POS — Project Plan')
  }
  expect(errors).toEqual([])
})

test('lightbox works with the keyboard and returns focus', async ({ page }) => {
  await page.goto('/projects/google-ads-dashboard')
  const first = page.getByRole('button', { name: /^Open image 1 of/ })
  await first.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Image viewer' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(dialog).toContainText('2 /')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(first).toBeFocused()
})

test('unknown path shows the 404 page', async ({ page }) => {
  await page.goto('/projects/does-not-exist')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist')
  await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible()
})

test('no horizontal page scroll on a 360px phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  for (const path of ['/', '/projects/ai-acceptance-research', '/projects/shoe-factory-database']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})
```

- [ ] **Step 3: Build and run e2e**

Run: `npm run build && npm run test:e2e`
Expected: 14 passed (7 tests × 2 projects). If the overflow test fails, find the widest element with `document.querySelectorAll('*')` in the browser console and fix it with `min-w-0` or `break-words`. Do not hide the overflow on `body`.

- [ ] **Step 4: Run the full check**

Run: `npm run check`
Expected: typecheck, lint, unit tests, build, build tests, privacy, and e2e all pass.

- [ ] **Step 5: Lighthouse (mobile)**

Run:
```bash
npm run preview &
npx -y lighthouse@latest http://localhost:4173/ --only-categories=performance,accessibility --form-factor=mobile --screenEmulation.mobile --quiet --chrome-flags="--headless=new" --output=json --output-path=.work/lh-home.json
npx -y lighthouse@latest http://localhost:4173/projects/google-ads-dashboard --only-categories=performance,accessibility --form-factor=mobile --screenEmulation.mobile --quiet --chrome-flags="--headless=new" --output=json --output-path=.work/lh-detail.json
node -e "for (const f of ['home','detail']) { const r = require('./.work/lh-' + f + '.json'); console.log(f, Object.fromEntries(Object.entries(r.categories).map(([k,v]) => [k, Math.round(v.score*100)]))) }"
kill %1
```
Expected: Performance ≥ 90 and Accessibility ≥ 90 on both pages. If Chrome is not found, set `CHROME_PATH` to Playwright's Chromium: `CHROME_PATH=$(node -e "console.log(require('@playwright/test').chromium.executablePath())")`.

- [ ] **Step 6: Manual review with Karvin**

Run `npm run preview` and review together:
- The page on desktop and on the phone emulator in DevTools.
- Motion with "reduce motion" turned on in macOS (System Settings → Accessibility → Display → Reduce motion). Everything must be static and fully visible.
- The keyboard-only path: Tab from the top, then the skip link, filter, cards, gallery, and lightbox.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add Playwright smoke tests and full check script

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

The branch `feat/portfolio-site` is then ready for Meini to review. Merging it into `main`, and pushing to Meini's GitHub, happen only after Karvin approves (spec §13 item 7).

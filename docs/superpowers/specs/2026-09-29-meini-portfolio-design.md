# Meini Rusiadi Portfolio — Design Spec

Date: 2026-09-29
Status: Draft for review

## 1. Goal

This is a personal portfolio website for Meini Rusiadi, an Information Systems student at BINUS University. She is applying for **Data Analyst, BI Analyst, QA, and Database** roles.

The readers are recruiters and technical interviewers. The site works when:

- A recruiter can tell who Meini is and see her best work in under one minute.
- Every project shows only **Meini's own contribution**, and links to evidence (Tableau, Figma, YouTube, Zenodo) where that evidence exists.
- The site reads well on a phone.
- Motion feels interactive, but it never slows the page down or gets in the way of reading.
- No personal data (student IDs, campus emails, classmates' names) is published.

Out of scope for v1: dark mode, i18n (the site is English only), a CMS, analytics, a contact form, a blog.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Language | English only |
| Structure | A home page, plus one detail page per project |
| Visual style | "Soft Lavender": light page, white and pale lavender, deep purple text, pink accents |
| Motion level | "Interactive": reveal on scroll, 3D tilt cards, count-up numbers, swipe gallery, magnetic buttons |
| Stack | Vite + Vue 3 + TypeScript + vue-router + vite-ssg + Tailwind CSS + @vueuse/core |
| Location | `/Users/karvin/meini/portfolio-web/`, as its own git repo |
| Hosting | Local only for now. It will be pushed to **Meini's** GitHub account and deployed on **Meini's** Vercel account later |
| Git identity | Repo-local config: Karvin's name with his personal email (`karvinnd1207@gmail.com`). The work email is never used in this repo |

## 3. Architecture

This is a static site. `vite-ssg` renders every route to its own HTML file at build time. After the page loads, Vue hydrates it for the interactive parts. There is no backend.

Pre-rendering each route gives every project page its own `<title>` and Open Graph tags, so a shared link shows the correct preview. It also means no SPA rewrite rule is needed on the host.

### Routes

| Route | Page | Notes |
|---|---|---|
| `/` | `HomePage.vue` | |
| `/projects/:slug` | `ProjectPage.vue` | One pre-rendered page per project in `projects.ts` |
| `*` | `NotFoundPage.vue` | Unknown slugs also render this page |

### Folder layout

```
portfolio-web/
  public/
    images/<slug>/*.webp          # screenshots and diagrams (not projects/: that would clash with clean URLs)
    og/<slug>.png                 # Open Graph images (1200×630)
  src/
    content/
      site.ts                     # name, headline, contact, skills, certificates
      projects.ts                 # Project[]
      types.ts                    # Project, Category, … types
    components/
      AppNav.vue  AppFooter.vue
      HeroSection.vue  StatsStrip.vue
      ProjectCard.vue  ProjectFilter.vue
      SkillsSection.vue  CertificatesSection.vue  ContactSection.vue
      ScreenshotGallery.vue  ImageLightbox.vue  ProjectNav.vue
    composables/
      useReveal.ts  useTilt.ts  useCountUp.ts  useMagnetic.ts  useMotionOk.ts
    pages/
      HomePage.vue  ProjectPage.vue  NotFoundPage.vue
    main.ts  App.vue  router.ts  styles.css
  tests/
    unit/  e2e/
  scripts/
    privacy-check.ts
    optimize-images.ts            # sharp: source images → WebP
```

Each component has one job. Components get data through props. Only the pages import from `src/content/`.

## 4. Pages

### Home (`/`), top to bottom

1. **Hero**: the headline "Turning messy data into clear decisions", the role line "Data & BI Analyst · QA · Database", and one line about BINUS Information Systems. Buttons: "View projects" (scrolls to the project list) and "Download CV" (hidden while no CV file exists).
2. **Numbers** (count-up): 11 projects · 281 survey responses analysed · 2,125 rows cleaned · 2 certificates.
3. **Featured**: 3 tilt cards for Google Ads Dashboard, Student Acceptance of AI (research), and SnapCash.
4. **All projects**: filter chips (All, Data & BI, Database, QA, Systems & PM, UX) above a grid of `ProjectCard`s. The filter is client-side state only, and it does not change the URL.
5. **Skills & tools**: tool chips grouped by area.
6. **Certificates**: text cards only (see §6).
7. **Contact**: `mailto:` and LinkedIn. GitHub is shown only if Meini has an account.

### Project detail (`/projects/:slug`)

1. A back link to "All projects".
2. Header: title, team ("Individual" or "Group of N"), course, term, role (if set), tool chips, and external link buttons (↗).
3. Overview: 2–3 sentences about the problem and the data.
4. **My contribution**: the bullet list.
5. Gallery: a horizontal swipe gallery of screenshots. Clicking an image opens the lightbox.
6. Key numbers (optional): the same count-up style as the home page.
7. Previous / next project navigation, in the order of `projects.ts`.

## 5. Content model

```ts
type Category = 'data-bi' | 'database' | 'qa' | 'systems-pm' | 'ux'

interface Project {
  slug: string                 // kebab-case, unique, used in URL
  title: string
  category: Category
  featured?: boolean
  course: string
  term: string                 // e.g. "Even 2025/2026"
  team: string                 // "Individual" | "Group of 4" — never member names
  role?: string
  tools: string[]
  summary: string              // one sentence, for cards
  overview: string             // 2–3 sentences, for detail page
  contributions: string[]      // at least 1
  stats?: { value: number; label: string }[]
  links?: { label: string; href: string }[]
  images: { src: string; alt: string; caption?: string }[]
}
```

### Project list (order = display order)

| # | slug | Category | Featured | Team | Term |
|---|---|---|---|---|---|
| 1 | `google-ads-dashboard` | data-bi | yes | Individual | from Meini |
| 2 | `ai-acceptance-research` | data-bi | yes | 2 students + lecturer | from Meini |
| 3 | `budgetwise-finance-dashboard` | data-bi | | Group of 6 | Even 2025/2026 |
| 4 | `ecommerce-order-analysis` | data-bi | | Group of 3 | Even 2025/2026 |
| 5 | `shoe-factory-database` | database | | Group of 5 | from Meini |
| 6 | `soundease-database` | database | | Group of 4 | Even 2024/2025 |
| 7 | `livetix-testing` | qa | | Group of 4 | Odd 2025/2026 |
| 8 | `snapcash-pos` | systems-pm | yes | Group of 5 | Even 2025/2026 |
| 9 | `stsport-booking-system` | systems-pm | | Group of 4 | Odd 2025/2026 |
| 10 | `tix-id-redesign` | ux | | Group of 3 | Odd 2024/2025 |
| 11 | `edupal-ai-teacher` | ux | | Group of 6 | from Meini |

The contribution bullets are the ones agreed in the chat on 2026-09-29. For the Research and Google Ads projects, they are Meini's own text.

MyStyle (UXRD, 2 members) is **not included** in v1. Its source document has little content. It can be added later if the `.fig` file has strong screens.

### Content rules

- Claim only the parts Meini listed as hers.
- Do not claim Selenium or Postman for LiveTix. The document only calls them "suitable".
- Do not claim bug report LT-001. It was written by another group.
- Do not include the BudgetWise insights section. It is not in Meini's list.
- Do not write "Power Query" for BudgetWise until Meini confirms it in her `.xlsx` file (Data → Queries & Connections).
- For LiveTix, write "designed 17 test cases", not "tested the app". The test cases were never executed.

## 6. Assets and privacy

### Images

1. Extract `word/media/*` from each `.docx`, and render the relevant PDF pages, into the scratchpad. The source folder is never changed.
2. Keep only images that show Meini's claimed parts: dashboards, diagrams, and prototype screens.
3. Look at every kept image. Drop or crop any image that shows a student ID, a campus email, or a classmate's name.
4. Skip EMF/WMF images, because browsers cannot display them.
5. Convert to WebP with `scripts/optimize-images.ts`, which uses `sharp` as a devDependency. Images are at most 1600 px wide, quality 80, and saved to `public/images/<slug>/`. On this Mac, `sips` cannot write WebP and `cwebp` is not installed.

Do **not** show these until they are fixed in the source (fixing them is Meini's choice):

- The Shoe Factory ERD (many-to-many relationships without junction tables).
- SoundEase query 10 (`ORDER BY` on a string built with `CONCAT`).
- The Shoe Factory MongoDB natural-join snippet (`localfield` / `ForeignField` casing, smart quotes).

### Never published

- Student IDs, `@binus.ac.id` emails, and classmates' names.
- Certificate PDFs. The SASC certificate shows a student ID. Certificates are shown as text cards (name, issuer, date).
- The Canva `/edit` link from the AI project.

### Links

Before a link is added, check each external link with a plain GET request. Keep it only if it loads **and** is view-only. Candidates: Tableau Public, YouTube, the Zenodo record, and Figma files for TIX ID, StSport, LiveTix, and EduPal.

## 7. Visual system

| Token | Value | Use |
|---|---|---|
| `bg` | `#fbf8ff` → `#f5eefc` gradient | page background |
| `surface` | `#ffffff` | cards |
| `ink` | `#1e1530` | body text |
| `muted` | `#6b5a80` | secondary text (about 6:1 contrast on `bg`) |
| `primary` | `#6d28d9` | buttons, links |
| `accent` | `#ec4899` | decoration and large text only |
| `line` | `#eadcfb` | borders |

Tokens are defined as CSS variables and mapped in `tailwind.config.ts`. The font is Inter Variable, self-hosted through `@fontsource-variable/inter`.

Layout is mobile-first, with breakpoints at 640 px and 1024 px. The side gutter is 16 px on phones. The page never scrolls horizontally.

## 8. Motion

All motion goes through `useMotionOk()`. It returns `false` when `prefers-reduced-motion: reduce` is set, or during SSR. When it returns `false`, every effect below is off, and count-ups show their final value.

| Composable | Behaviour | Limits |
|---|---|---|
| `useReveal` | Fades in and moves up 14 px when the element first enters the viewport (`IntersectionObserver`) | 0.6 s, 80 ms stagger, runs once |
| `useTilt` | Rotates the card toward the pointer, and resets on leave | Max 8°. Only when `(hover: hover) and (pointer: fine)` |
| `useCountUp` | Counts from 0 to the target when visible, with a cubic ease-out | 1.2 s. The SSR HTML contains the final number |
| `useMagnetic` | Moves the button toward the pointer | Max 6 px, fine pointer only |

- Route change: a 200 ms opacity fade.
- **Gallery:** native horizontal scroll with CSS `scroll-snap`, so touch, trackpad, and keyboard work without JS. It also has ←/→ buttons and mouse drag-to-scroll.
- **Lightbox:** a native `<dialog>`. Esc closes it and ←/→ move between images. Focus stays inside, and it returns to the image that opened it.

Code that reads `window` or `document` runs only inside `onMounted`, so the SSR build does not break.

## 9. Accessibility and performance

- Semantic headings, with one `h1` per page.
- Visible focus rings. The site works fully with a keyboard.
- Filter chips are `<button aria-pressed>`.
- Every image has `alt`, `width`, and `height`, plus `loading="lazy"` below the fold.
- Target: Lighthouse mobile scores of at least 90 for Performance and Accessibility.

## 10. Error handling

- Unknown slug → `NotFoundPage`, with a link back home.
- Image fails to load → a lavender placeholder that shows the alt text.
- External links → `target="_blank" rel="noopener noreferrer"`.
- There are no forms or network calls at runtime, so there are no API errors to handle.

## 11. Testing

| Layer | Tool | What it checks |
|---|---|---|
| Content | Vitest | Unique slugs. At least 1 contribution per project. Every image `src` exists under `public/`. Every image has `alt`. Every category is valid |
| Privacy | Vitest + `scripts/privacy-check.ts` | Fails if `src/content/` or `dist/` matches `\b28\d{8}\b` (student ID), `@binus\.ac\.id`, or `canva\.com/design/\S+/edit` |
| Composables | Vitest (fake timers, jsdom) | `useCountUp` reaches the target. Effects are disabled when motion is off |
| Build | Vitest on `dist/` | `dist/projects/<slug>.html` exists (flat output, served at `/projects/<slug>` by `vercel.json` cleanUrls) for all 11 slugs, each with its own `<title>` and `og:title` |
| E2E smoke | Playwright (desktop + mobile viewport) | Home renders. The filter changes the cards. The detail page opens. The lightbox closes on Esc. An unknown slug shows 404 |
| Manual | Browser, together | Look and feel, motion, and phone layout |

`npm run check` runs typecheck, lint, unit tests, build, privacy check, and e2e in that order.

## 12. Tooling

- Node 22 LTS (already installed through fnm), pinned in `.nvmrc`. npm.
- ESLint (`@vue/eslint-config-typescript`) and Prettier.
- Conventional Commits. Work happens on feature branches, never directly on `main`.
- `.gitignore` covers `node_modules/`, `dist/`, and `.superpowers/`.
- Future Vercel settings (Meini's account): build command `npm run build`, output directory `dist`.
- Open Graph tags need absolute URLs. The site origin comes from `VITE_SITE_URL`, set in Vercel project settings. A local build falls back to `http://localhost:4173`. No secrets are involved, so `.env.example` documents the variable and no `.env` file is committed.

## 13. Open items

There is no GitHub remote yet, so open items are tracked here. They move to GitHub issues once a repo exists.

| # | Item | Owner | Blocks |
|---|---|---|---|
| 1 | Confirm Power Query use in BudgetWise `.xlsx` | Meini | One word in one bullet |
| 2 | CV as a PDF | Meini | "Download CV" button (hidden until provided) |
| 3 | Personal email, LinkedIn URL, GitHub (if any) | Meini | Contact section |
| 4 | Terms for projects 1, 2, 5, 11, and current semester / graduation year | Meini | Term labels (hidden if missing) |
| 5 | Photo (optional) | Meini | Nothing. The hero works without one |
| 6 | Fix the Shoe Factory ERD, SoundEase Q10, and the MongoDB snippet, if she wants them shown | Meini | Those images only |
| 7 | Meini creates the GitHub repo and Vercel project, and adds Karvin as a collaborator. Then set `VITE_SITE_URL` | Meini | Deploy and correct OG URLs |
| 8 | Decide whether to include MyStyle | Meini | Nothing |
| 9 | The EduPal Figma file does not open when logged out. Share it as "Anyone with the link can view" if she wants it linked | Meini | One link |
| 10 | The SnapCash critical-path diagram has a duplicate "T" node, and its arrows contradict the forward/backward pass tables. Fix it if she wants it shown | Meini | One image |
| 11 | The Shoe Factory natural-join sample data has receipt dates (2024) before purchase dates (2025) | Meini | One image |

Missing content never blocks the build. Every optional field is hidden when it is empty.

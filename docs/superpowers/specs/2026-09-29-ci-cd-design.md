# CI/CD for the Meini Portfolio — Design Spec

Date: 2026-09-29
Status: Draft for review
Builds on: `2026-09-29-meini-portfolio-design.md`

## 1. Goal

Meini edits content, opens a pull request, looks at a preview URL, and merges. The site then goes live on Vercel. Broken or privacy-leaking changes never reach production.

The setup works when:

- Every pull request and every push to `main` runs the full test suite (`npm run check`).
- Every pull request gets its own Vercel preview URL.
- A merge to `main` deploys production. That deploy is promoted only after the CI check passes.
- If the privacy guard finds a student ID, a campus email, or a Canva `/edit` link, nothing is deployed, not even a preview.
- No long-lived deploy token is stored anywhere.

Out of scope: Lighthouse in CI, dependency update bots, custom domains, analytics.

## 2. Decisions

| Topic | Decision |
|---|---|
| Who deploys | **Vercel Git integration.** Vercel pulls from Meini's GitHub repo and builds by itself |
| Who tests | **GitHub Actions**, one job named `check` |
| Gate to production | GitHub branch protection on `main` (PR required, `check` required) plus Vercel **Deployment Checks** waiting for `check` |
| Secrets | None in GitHub. Vercel holds only `VITE_SITE_URL` (not a secret) |

The alternative, deploying from GitHub Actions with the Vercel CLI, was rejected. It needs a long-lived `VERCEL_TOKEN` in GitHub secrets with access to Meini's Vercel account.

## 3. Flow

```
feature branch → push → pull request to main
   ├─ GitHub Actions  "check": npm ci → playwright install → npm run check
   └─ Vercel          preview build (npm run build, which includes the privacy check) → preview URL on the PR
merge to main (blocked unless "check" passed)
   ├─ GitHub Actions  "check" runs again on main
   └─ Vercel          production build → promoted after "check" passes (Deployment Checks)
```

## 4. Files

### `.github/workflows/ci.yml`

- Triggers: `pull_request` (any branch) and `push` to `main`.
- `permissions: contents: read`. The job needs nothing else.
- `concurrency`: one run per ref, and a new push cancels the older run.
- One job, `check`, on `ubuntu-latest`, with a 15-minute timeout:
  1. `actions/checkout`
  2. `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`
  3. `npm ci`
  4. `npx playwright install --with-deps chromium`
  5. `npm run check`
  6. On failure: upload `playwright-report/` as an artifact, kept for 7 days.
- Actions are pinned to a major version tag (for example `actions/checkout@v5`).

### `package.json`

- Already done in the review fix pass (commit `59604ee`): `build` is `vite-ssg build && tsx scripts/privacy-check.ts`, so Vercel fails the build on a privacy violation. `check` no longer runs `privacy` separately, because `build` includes it.

### `vercel.json`

Already present: `buildCommand`, `outputDirectory`, `cleanUrls: true`, `trailingSlash: false`.

## 5. Manual setup (Meini, in her own accounts)

These steps cannot be done from this laptop, and they must be done in Meini's accounts. Order matters.

1. **GitHub:** create the repository (private or public, her choice). Push `main` and `feat/portfolio-site`. Add Karvin as a collaborator.
2. **Vercel:** "Add New → Project → Import" the repository. The framework preset is "Other", and the build and output settings come from `vercel.json`.
3. **Vercel → Settings → Environment Variables:** set `VITE_SITE_URL` to the production URL (for example `https://meini.vercel.app`) for Production. For Preview, set it to the same value, or leave it empty and accept localhost OG URLs on previews.
4. **GitHub → Settings → Branches → `main`:** require a pull request before merging, require the status check `check`, and block force pushes.
5. **Vercel → Settings → Deployment Checks:** add the GitHub check `check`, so production waits for it.
6. **Smoke test:** open one pull request that breaks a unit test and confirm that merge is blocked. Then open one that passes, confirm that the preview URL works, merge it, and confirm that production updates.

## 6. Verification before handing over

- `actionlint` on `ci.yml` locally (installed temporarily through `npx`, nothing global).
- `npm run build` fails when a fake student ID is added to the content, and passes after it is removed.
- The real end-to-end proof is the step 6 smoke test in Meini's repository. It cannot be run before the repository exists.

## 7. Risks

| Risk | Effect | Mitigation |
|---|---|---|
| Deployment Checks not enabled (step 5 skipped) | Production can go live before CI finishes | The checklist in §5, and branch protection still blocks red PRs from merging |
| `VITE_SITE_URL` missing | Link previews point to localhost | Checklist step 3. Also recorded as a deferred minor from the review |
| Playwright browser download is slow or flaky in CI | Longer runs, rare flakes | Chromium only, npm cache, 15-minute timeout |

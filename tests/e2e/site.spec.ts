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

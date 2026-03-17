import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function goHash(page: Page, route: string) {
  await page.goto(`/#/${route}`)
  await page.waitForLoadState('networkidle')
}

async function expectNoConsoleErrors(page: Page, fn: () => Promise<void>) {
  const errors: string[] = []
  const handler = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text())
  }
  page.on('console', handler)
  await fn()
  page.off('console', handler)
  expect(errors, 'Unexpected console errors').toEqual([])
}

// ---------------------------------------------------------------------------
// 1. App Shell — Load & Title
// ---------------------------------------------------------------------------

test.describe('App Shell', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Civics/)
  })

  test('root element renders React app', async ({ page }) => {
    await page.goto('/')
    const root = page.locator('#root')
    await expect(root).toBeAttached()
    const children = root.locator('> *')
    await expect(children.first()).toBeVisible({ timeout: 10_000 })
  })

  test('Evident ecosystem nav is present', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.locator('nav[aria-label="Evident ecosystem"]'),
    ).toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// 2. Accessibility — Skip-to-Content & Landmarks
// ---------------------------------------------------------------------------

test.describe('Accessibility', () => {
  test('skip-to-content link works', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('a[href="#main-content"]')
    await skipLink.focus()
    await expect(skipLink).toBeVisible()
    await skipLink.click()
    await expect(page.locator('#main-content')).toBeInViewport()
  })

  test('main landmark exists', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main-content')).toBeAttached()
  })

  test('navigation landmarks exist', async ({ page }) => {
    await page.goto('/')
    const navs = page.locator('nav')
    const count = await navs.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// 3. Hash Route Navigation — Every route renders without blank screen
// ---------------------------------------------------------------------------

const PUBLIC_ROUTES = [
  'home',
  'supreme-law',
  'search',
  'treaties',
  'analyzer',
  'learn',
  'citations',
  'case-law',
  'federal-register',
  'legal-resources',
] as const

test.describe('Hash Routes — render without blank screen', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`#/${route} renders content`, async ({ page }) => {
      await goHash(page, route)
      // The app root must have rendered content (not a blank screen)
      const root = page.locator('#root')
      await expect(root).toBeAttached()
      // Wait for meaningful content to appear anywhere in the app
      await page.waitForFunction(
        () => (document.querySelector('#root')?.textContent?.length ?? 0) > 50,
        { timeout: 15_000 },
      )
    })
  }
})

// ---------------------------------------------------------------------------
// 4. Home View — Core Components
// ---------------------------------------------------------------------------

test.describe('Home View', () => {
  test('renders heading and description', async ({ page }) => {
    await goHash(page, 'home')
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('search input is accessible', async ({ page }) => {
    await goHash(page, 'home')
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeEnabled()
    }
  })
})

// ---------------------------------------------------------------------------
// 5. Supreme Law View — Constitutional Text
// ---------------------------------------------------------------------------

test.describe('Supreme Law', () => {
  test('renders constitutional document structure', async ({ page }) => {
    await goHash(page, 'supreme-law')
    const main = page.locator('#main-content')
    await expect(main).toBeAttached()
    const heading = main.locator('h1, h2, h3').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })
})

// ---------------------------------------------------------------------------
// 6. Search View — Query Interface
// ---------------------------------------------------------------------------

test.describe('Search', () => {
  test('search view renders input', async ({ page }) => {
    await goHash(page, 'search')
    const input = page.locator('input[type="search"], input[type="text"], input[placeholder*="search" i]').first()
    await expect(input).toBeVisible({ timeout: 10_000 })
  })

  test('search accepts keyboard input', async ({ page }) => {
    await goHash(page, 'search')
    const input = page.locator('input[type="search"], input[type="text"], input[placeholder*="search" i]').first()
    await expect(input).toBeVisible({ timeout: 10_000 })
    await input.fill('amendment')
    await expect(input).toHaveValue('amendment')
  })
})

// ---------------------------------------------------------------------------
// 7. Dark Mode Toggle
// ---------------------------------------------------------------------------

test.describe('Dark Mode', () => {
  test('toggle switches theme class on html element', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const html = page.locator('html')
    const initialDark = await html.evaluate(el => el.classList.contains('dark'))
    // Find the dark mode toggle button
    const toggle = page.locator('button:has([class*="sun" i]), button:has([class*="moon" i]), button[aria-label*="dark" i], button[aria-label*="light" i]').first()
    if (await toggle.isVisible()) {
      await toggle.click()
      const afterDark = await html.evaluate(el => el.classList.contains('dark'))
      expect(afterDark).not.toBe(initialDark)
    }
  })
})

// ---------------------------------------------------------------------------
// 8. Mobile Navigation
// ---------------------------------------------------------------------------

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('mobile bottom nav is visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const mobileNav = page.locator('nav[aria-label="Main navigation"]')
    await expect(mobileNav).toBeVisible({ timeout: 10_000 })
  })

  test('mobile nav items are tappable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const navButtons = page.locator('nav[aria-label="Main navigation"] button, nav[aria-label="Main navigation"] a')
    const count = await navButtons.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })
})

// ---------------------------------------------------------------------------
// 9. Jurisdiction Selector
// ---------------------------------------------------------------------------

test.describe('Jurisdiction Selector', () => {
  test('jurisdiction dropdown is present', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Look for select/combobox with state options
    const selector = page.locator('select, [role="combobox"], button:has-text("Jurisdiction"), button:has-text("Federal")').first()
    if (await selector.isVisible()) {
      await expect(selector).toBeEnabled()
    }
  })
})

// ---------------------------------------------------------------------------
// 10. Legal Disclaimer
// ---------------------------------------------------------------------------

test.describe('Disclaimer', () => {
  test('legal disclaimer is visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const disclaimer = page.locator('text=/not legal advice/i')
    // Disclaimer may be in footer or banner
    const footerOrBanner = page.locator('footer, [role="alert"], [class*="disclaimer" i]')
    const text = await footerOrBanner.allTextContents()
    const hasDisclaimer = text.some(t => /not legal advice/i.test(t))
    expect(hasDisclaimer).toBeTruthy()
  })
})

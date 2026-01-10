import {test, expect, Page} from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * UI Improvement Workflow
 * This test suite captures screenshots and analyzes UI for iterative improvements
 */

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'ui-analysis')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, {recursive: true})
}

// Helper function to capture and analyze UI elements
async function captureUIElement(page: Page, selector: string, name: string) {
  const element = page.locator(selector).first()
  if (await element.isVisible()) {
    await element.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      animations: 'disabled',
    })

    // Get element metrics
    const box = await element.boundingBox()
    const styles = await element.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        padding: computed.padding,
        margin: computed.margin,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
      }
    })

    return {name, box, styles, selector}
  }
  return null
}

test.describe('UI Analysis and Improvement Workflow', () => {
  let uiAnalysis: any[] = []

  test('Capture Homepage UI State', async ({page, browserName}) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Full page screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, `homepage-full-${browserName}.png`),
      fullPage: true,
      animations: 'disabled',
    })

    // Capture hero section
    const heroAnalysis = await captureUIElement(
      page,
      'section:first-of-type',
      'hero-section',
    )
    if (heroAnalysis) uiAnalysis.push(heroAnalysis)

    // Capture navigation
    const navAnalysis = await captureUIElement(page, 'nav', 'navigation')
    if (navAnalysis) uiAnalysis.push(navAnalysis)

    // Capture buttons
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const btnAnalysis = await captureUIElement(
        page,
        `button:nth-of-type(${i + 1})`,
        `button-${i + 1}`,
      )
      if (btnAnalysis) uiAnalysis.push(btnAnalysis)
    }

    // Capture cards/sections
    const cards = page.locator(
      '[class*="card"], [class*="Card"], article, section > div',
    )
    const cardCount = await cards.count()
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      await cards.nth(i).screenshot({
        path: path.join(screenshotsDir, `card-${i + 1}.png`),
        animations: 'disabled',
      })
    }

    // Save analysis data
    fs.writeFileSync(
      path.join(screenshotsDir, 'ui-analysis.json'),
      JSON.stringify(uiAnalysis, null, 2),
    )
  })

  test('Analyze Mobile Responsiveness', async ({page}) => {
    const viewports = [
      {name: 'mobile', width: 375, height: 667},
      {name: 'tablet', width: 768, height: 1024},
      {name: 'desktop', width: 1920, height: 1080},
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: path.join(screenshotsDir, `responsive-${viewport.name}.png`),
        fullPage: false,
        animations: 'disabled',
      })

      // Check for overflow issues
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        )
      })

      if (hasHorizontalScroll) {
        console.log(
          `⚠️ Horizontal scroll detected at ${viewport.name} viewport`,
        )
      }
    }
  })

  test('Analyze Color Contrast and Accessibility', async ({page}) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityIssues: any[] = []

    // Check text contrast
    const textElements = page.locator(
      'p, h1, h2, h3, h4, h5, h6, span, a, button',
    )
    const textCount = await textElements.count()

    for (let i = 0; i < Math.min(textCount, 20); i++) {
      const element = textElements.nth(i)
      const contrast = await element.evaluate(el => {
        const styles = window.getComputedStyle(el)
        const bg = styles.backgroundColor
        const fg = styles.color
        return {background: bg, foreground: fg, fontSize: styles.fontSize}
      })

      // Store for analysis
      accessibilityIssues.push({
        element: i,
        ...contrast,
      })
    }

    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    let missingAltCount = 0

    for (let i = 0; i < imageCount; i++) {
      const hasAlt = await images.nth(i).getAttribute('alt')
      if (!hasAlt || hasAlt.trim() === '') {
        missingAltCount++
      }
    }

    if (missingAltCount > 0) {
      console.log(`⚠️ ${missingAltCount} images missing alt text`)
    }

    fs.writeFileSync(
      path.join(screenshotsDir, 'accessibility-analysis.json'),
      JSON.stringify(accessibilityIssues, null, 2),
    )
  })

  test('Analyze Theme Consistency', async ({page}) => {
    const themes = ['light', 'dark']

    for (const theme of themes) {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Try to set theme
      const themeToggle = page
        .locator(
          'button[aria-label*="theme" i], button:has(svg[class*="sun" i]), button:has(svg[class*="moon" i])',
        )
        .first()

      if (await themeToggle.isVisible()) {
        const htmlElement = page.locator('html')
        const currentTheme = (await htmlElement.getAttribute('class')) || ''

        if (theme === 'dark' && !currentTheme.includes('dark')) {
          await themeToggle.click()
          await page.waitForTimeout(500)
        } else if (theme === 'light' && currentTheme.includes('dark')) {
          await themeToggle.click()
          await page.waitForTimeout(500)
        }
      }

      // Capture theme screenshots
      await page.screenshot({
        path: path.join(screenshotsDir, `theme-${theme}.png`),
        fullPage: true,
        animations: 'disabled',
      })

      // Analyze color palette
      const colorPalette = await page.evaluate(() => {
        const elements = document.querySelectorAll('*')
        const colors = new Set<string>()

        elements.forEach(el => {
          const styles = window.getComputedStyle(el)
          if (
            styles.backgroundColor &&
            styles.backgroundColor !== 'rgba(0, 0, 0, 0)'
          ) {
            colors.add(styles.backgroundColor)
          }
          if (styles.color) {
            colors.add(styles.color)
          }
        })

        return Array.from(colors)
      })

      fs.writeFileSync(
        path.join(screenshotsDir, `color-palette-${theme}.json`),
        JSON.stringify(colorPalette, null, 2),
      )
    }
  })

  test('Capture User Flow Screenshots', async ({page}) => {
    const flows = [
      {
        name: 'home-to-exchange',
        path: '/',
        action: 'click text=/Crypto Exchange/i',
        finalPath: '/cryptoexchange',
      },
      {
        name: 'home-to-donate',
        path: '/',
        action: 'click text=/Donate/i',
        finalPath: '/donate',
      },
    ]

    for (const flow of flows) {
      await page.goto(flow.path)
      await page.waitForLoadState('networkidle')

      // Before action
      await page.screenshot({
        path: path.join(screenshotsDir, `flow-${flow.name}-before.png`),
        fullPage: false,
        animations: 'disabled',
      })

      // Perform action
      await page.locator(flow.action.replace('click ', '')).first().click()
      await page.waitForLoadState('networkidle')

      // After action
      await page.screenshot({
        path: path.join(screenshotsDir, `flow-${flow.name}-after.png`),
        fullPage: false,
        animations: 'disabled',
      })
    }
  })

  test('Performance Metrics Capture', async ({page}) => {
    await page.goto('/')

    // Capture performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming
      return {
        domContentLoaded:
          perfData.domContentLoadedEventEnd -
          perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName(
          'first-contentful-paint',
        )[0]?.startTime,
      }
    })

    fs.writeFileSync(
      path.join(screenshotsDir, 'performance-metrics.json'),
      JSON.stringify(metrics, null, 2),
    )

    console.log('📊 Performance Metrics:', metrics)
  })
})

test.describe('Generate UI Improvement Report', () => {
  test('Create Comprehensive UI Report', async ({page}) => {
    // Read all analysis files
    const report = {
      timestamp: new Date().toISOString(),
      screenshotsPath: screenshotsDir,
      recommendations: [
        '1. Review color contrast in accessibility-analysis.json',
        '2. Check responsive layouts in responsive-*.png screenshots',
        '3. Verify theme consistency in theme-*.png screenshots',
        '4. Analyze user flows in flow-*.png screenshots',
        '5. Review performance metrics in performance-metrics.json',
      ],
      files: fs.readdirSync(screenshotsDir),
    }

    fs.writeFileSync(
      path.join(screenshotsDir, 'ui-improvement-report.json'),
      JSON.stringify(report, null, 2),
    )

    console.log('✅ UI Analysis Complete!')
    console.log(`📁 Screenshots and analysis saved to: ${screenshotsDir}`)
    console.log('📊 Review the following files:')
    console.log('   - ui-analysis.json: Element measurements and styles')
    console.log('   - accessibility-analysis.json: Contrast and a11y issues')
    console.log('   - color-palette-*.json: Color usage per theme')
    console.log('   - performance-metrics.json: Page load metrics')
    console.log('   - ui-improvement-report.json: Summary and recommendations')
  })
})

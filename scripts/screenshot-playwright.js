const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // Ensure screenshots directory exists
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = process.env.BASE_URL || 'http://localhost:5173';
  console.log('Opening', base);

  // Try to load the app and wait until the app root is ready
  try {
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 20000 });
  } catch (err) {
    console.warn('Initial navigation or selector wait failed, trying fallback goto:', err && err.message);
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    try {
      await page.waitForSelector('#app', { timeout: 20000 });
    } catch (e) {
      console.warn('Fallback waitForSelector failed:', e && e.message);
    }
  }

  // Small pause to let client-side rendering settle
  await page.waitForTimeout(1500);

  // Try opening Preferences / Saved views safely
  try {
    const prefBtn = await page.$('button:has-text("Gemte visninger")');
    if (prefBtn) {
      await prefBtn.click();
      await page.waitForTimeout(300);
    }
  } catch (e) {
    console.warn('Could not open saved views:', e && e.message);
  }

  // Screenshot TopBar area
  const header = await page.$('header');
  if (header) {
    await header.screenshot({ path: 'screenshots/screenshot-topbar.png' });
    console.log('Wrote screenshots/screenshot-topbar.png');
  }

  // Deterministic dev navigation via exposed global helper
  try {
    await page.evaluate(() => {
      if (window.__navigateTo) {
        // Use a stable breadcrumb for the business view
        // Note: only available when the app exposes window.__navigateTo (dev only)
        window.__navigateTo('business', { breadcrumbs: ['Dashboard', 'Erhverv'] });
      }
    });
  } catch (e) {
    console.warn('Could not call __navigateTo:', e && e.message);
  }

  // Wait a bit then capture breadcrumbs area (or fallback)
  await page.waitForTimeout(1500);
  try {
    const crumbs = await page.$('nav[aria-label="Breadcrumb"]');
    if (crumbs) {
      await crumbs.screenshot({ path: 'screenshots/screenshot-nested-breadcrumbs.png' });
      console.log('Wrote screenshots/screenshot-nested-breadcrumbs.png');
    } else {
      await page.screenshot({ path: 'screenshots/screenshot-nested-breadcrumbs.png', fullPage: false });
      console.log('Wrote fallback screenshots/screenshot-nested-breadcrumbs.png');
    }
  } catch (e) {
    console.warn('Breadcrumbs capture failed:', e && e.message);
  }

  // Saved views dropdown screenshot (open if not open)
  try {
    const savedBtn = await page.$('button:has-text("Gemte visninger")');
    if (savedBtn) await savedBtn.click();
    await page.waitForTimeout(300);
    const savedPanel = await page.$('div:has-text("Gemte visninger")');
    if (savedPanel) {
      await savedPanel.screenshot({ path: 'screenshots/screenshot-saved-views.png' });
      console.log('Wrote screenshots/screenshot-saved-views.png');
    } else {
      await page.screenshot({ path: 'screenshots/screenshot-saved-views.png' });
      console.log('Wrote fallback screenshots/screenshot-saved-views.png');
    }
  } catch (e) {
    console.warn('Saved views capture failed:', e && e.message);
  }

  await browser.close();
  console.log('Done');
})();

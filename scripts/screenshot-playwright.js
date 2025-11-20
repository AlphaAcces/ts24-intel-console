const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = process.env.BASE_URL || 'http://localhost:5173';
  console.log('Opening', base);
  await page.goto(base, { waitUntil: 'networkidle' });

  // Wait for TopBar
  await page.waitForSelector('header');

  // Try to open saved views (PreferencesPanel)
  try {
    // Click the button that toggles saved views. If not visible, try to open menu first.
    const btn = await page.$('button:has-text("Gemte visninger")');
    if (btn) {
      await btn.click();
      await page.waitForTimeout(300);
    }
  } catch (e) {
    console.warn('Could not open saved views:', e.message);
  }

  // Screenshot TopBar area
  const header = await page.$('header');
  if (header) {
    await header.screenshot({ path: 'screenshot-topbar.png' });
    console.log('Wrote screenshot-topbar.png');
  }

  // Navigate to Business -> Financials to produce nested breadcrumbs
  try {
    // Click SideNav Business button (label 'Erhverv')
    const businessBtn = await page.$('button:has-text("Erhverv")');
    if (businessBtn) {
      await businessBtn.click();
      await page.waitForTimeout(500);
    }

    // Click Financials in nav
    const finBtn = await page.$('button:has-text("Financials")');
    if (finBtn) {
      await finBtn.click();
      await page.waitForTimeout(500);
    }

    // Attempt to simulate deep breadcrumb by executing navigateTo if exposed
    await page.evaluate(() => {
      // If your app exposes a global navigation helper, uncomment and adapt below
      // window.__navigateTo?.('financials', { breadcrumbs: ['Erhverv', 'Financials', 'KPI', 'Report'] });
    });

    // Wait and screenshot breadcrumbs area
    const crumbs = await page.$('nav[aria-label="Breadcrumb"]');
    if (crumbs) {
      await crumbs.screenshot({ path: 'screenshot-nested-breadcrumbs.png' });
      console.log('Wrote screenshot-nested-breadcrumbs.png');
    } else {
      await page.screenshot({ path: 'screenshot-nested-breadcrumbs.png', fullPage: false });
      console.log('Wrote fallback screenshot-nested-breadcrumbs.png');
    }
  } catch (e) {
    console.warn('Breadcrumbs capture failed:', e.message);
  }

  // Saved views dropdown screenshot (open if not open)
  try {
    const savedBtn = await page.$('button:has-text("Gemte visninger")');
    if (savedBtn) await savedBtn.click();
    await page.waitForTimeout(300);
    const savedPanel = await page.$('div:has-text("Gemte visninger")');
    if (savedPanel) {
      await savedPanel.screenshot({ path: 'screenshot-saved-views.png' });
      console.log('Wrote screenshot-saved-views.png');
    } else {
      await page.screenshot({ path: 'screenshot-saved-views.png' });
      console.log('Wrote fallback screenshot-saved-views.png');
    }
  } catch (e) {
    console.warn('Saved views capture failed:', e.message);
  }

  await browser.close();
  console.log('Done');
})();

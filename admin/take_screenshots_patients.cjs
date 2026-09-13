const puppeteer = require('puppeteer');
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const ARTIFACT_DIR = 'C:/Users/prana/.gemini/antigravity-ide/brain/96308e89-9242-48d8-a5b5-b90507c45ec9';

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } });
  const page = await browser.newPage();
  
  // Set tokens to Admin
  await page.goto('http://localhost:5174/');
  await page.evaluate(() => {
    localStorage.setItem('aToken', 'mock-admin-token');
    localStorage.setItem('adminPermissions', JSON.stringify(['manage_users', 'manage_roles', 'view_reports']));
  });

  // Navigate to Daily Reports
  await page.goto('http://localhost:5174/admin/daily-reports');
  await wait(2000);
  
  // Find all View Details buttons
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('View Details')) {
      await btn.click(); // Click the first one (which should be today or yesterday)
      break;
    }
  }

  await wait(2000); // Wait for detail page to load and fetch patient list

  // Scroll down a bit to ensure patient list is in view
  await page.evaluate(() => {
    window.scrollBy(0, 300);
  });
  await wait(500);

  await page.screenshot({ path: `${ARTIFACT_DIR}/daily_report_detail_patients.png` });

  await browser.close();
})();

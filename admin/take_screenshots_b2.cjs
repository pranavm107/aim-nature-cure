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

  // 1. User Management - Create New Role Flow
  await page.goto('http://localhost:5174/admin/users');
  await wait(1000);

  let buttons = await page.$$('button');
  for(let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if(text.includes('Add New User')) {
      await btn.click();
      break;
    }
  }
  await wait(500);
  
  // Select "+ Create New Role"
  await page.select('select', 'CREATE_NEW');
  await wait(500);
  await page.screenshot({ path: `${ARTIFACT_DIR}/create_new_role_modal.png` });

  // 2. Admin Daily Reports - Filters
  await page.goto('http://localhost:5174/admin/daily-reports');
  await wait(1000);
  
  // Fill doctor filter to show it works
  await page.select('select', 'doc1');
  await wait(500);
  await page.screenshot({ path: `${ARTIFACT_DIR}/daily_reports_filters.png` });

  await browser.close();
})();

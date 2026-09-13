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

  // 1. Admin Daily Reports - Unfiltered
  await page.goto('http://localhost:5174/admin/daily-reports');
  await wait(2000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/daily_reports_unfiltered.png` });

  // 2. Admin Daily Reports - Filtered
  await page.evaluate(() => {
    const sel = document.querySelector('select');
    if (sel) {
      sel.value = 'doc1';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/daily_reports_filtered.png` });

  // 3. User Management - Role Round-Trip Validation
  await page.goto('http://localhost:5174/admin/users');
  await wait(2000);

  let buttons = await page.$$('button');
  for(let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if(text.includes('Add New User')) {
      await btn.click();
      break;
    }
  }
  await wait(1000);
  
  // Select "+ Create New Role"
  await page.evaluate(() => {
    const sel = document.querySelector('select');
    if (sel) {
      sel.value = 'CREATE_NEW';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await wait(1000);
  
  // Fill the new role form
  let inputs = await page.$$('input[type="text"]');
  if(inputs.length > 0) {
    await inputs[inputs.length - 1].type('Test Auto Role');
  }

  // Check first permission
  let checkboxes = await page.$$('input[type="checkbox"]');
  if (checkboxes.length > 0) {
    await checkboxes[0].click();
  }

  // Click Save Role
  let submitBtns = await page.$$('button[type="submit"]');
  if (submitBtns.length > 1) {
    await submitBtns[submitBtns.length - 1].click();
  }
  
  await wait(1500); // Wait for modal to close and state to update
  await page.screenshot({ path: `${ARTIFACT_DIR}/user_modal_role_preselected.png` });

  await browser.close();
})();

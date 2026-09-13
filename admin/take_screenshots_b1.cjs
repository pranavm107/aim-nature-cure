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
    localStorage.setItem('adminPermissions', JSON.stringify(['manage_users', 'manage_roles']));
  });

  // Go to User Management
  await page.goto('http://localhost:5174/admin/users');
  await wait(1000);

  // Click Add New User
  let buttons = await page.$$('button');
  for(let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if(text.includes('Add New User')) {
      await btn.click();
      break;
    }
  }
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/add_new_user_modal.png` });

  // Fill form to trigger mock email toast
  await page.type('input[placeholder="Admin Name"], input[placeholder="User Name"]', 'Test Role User');
  await page.type('input[placeholder="user@example.com"]', 'testrole@example.com');
  
  // Select role
  await page.select('select', 'receptionist'); 
  // we assume receptionist or similar exists, wait let me just pick the second option
  const options = await page.$$('select option');
  if(options.length > 1) {
    const val = await page.evaluate(el => el.value, options[1]);
    await page.select('select', val);
  }

  // Click submit
  let submitBtns = await page.$$('button[type="submit"]');
  if (submitBtns.length > 0) {
    await submitBtns[0].click();
  }

  await wait(1000); // wait for toast
  await page.screenshot({ path: `${ARTIFACT_DIR}/mock_email_toast.png` });

  // Now simulate login as new user to show force password reset
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('mustChangePassword', 'true');
    localStorage.setItem('tempToken', 'some-temp-token'); // just to simulate authenticated state if needed
    // or since App.js redirects to login if !isAuthenticated, 
    // wait, how does ForcePasswordReset work?
    // It is protected. So user needs aToken or dToken.
    localStorage.setItem('aToken', 'mock-new-user-token');
  });

  await page.goto('http://localhost:5174/force-password-reset');
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/force_password_reset.png` });

  await browser.close();
})();

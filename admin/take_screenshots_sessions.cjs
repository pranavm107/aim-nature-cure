const puppeteer = require('puppeteer');
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const ARTIFACT_DIR = 'C:/Users/prana/.gemini/antigravity-ide/brain/96308e89-9242-48d8-a5b5-b90507c45ec9';

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 900 } });
  const page = await browser.newPage();
  
  // Set tokens to Doctor
  await page.goto('http://localhost:5174/');
  await page.evaluate(() => {
    localStorage.setItem('dToken', 'mock-doc-token');
  });

  // Navigate to Doctor Therapy Sessions
  await page.goto('http://localhost:5174/doctor/sessions');
  await wait(2000); // Wait for load

  // Take screenshot of the full dashboard showing Completed, Missed, Pending
  await page.screenshot({ path: `${ARTIFACT_DIR}/therapy_sessions_dashboard.png` });

  // Find a "Mark Missed" button and click it
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.trim() === 'Mark Missed') {
      await btn.click();
      break;
    }
  }
  
  await wait(1000); // Wait for modal
  
  // Take screenshot of modal
  await page.screenshot({ path: `${ARTIFACT_DIR}/therapy_sessions_missed_modal.png` });

  await browser.close();
})();

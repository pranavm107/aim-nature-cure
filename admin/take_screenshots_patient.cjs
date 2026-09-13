const puppeteer = require('puppeteer');
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const ARTIFACT_DIR = 'C:/Users/prana/.gemini/antigravity-ide/brain/96308e89-9242-48d8-a5b5-b90507c45ec9';

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } });
  const page = await browser.newPage();
  
  // Set tokens
  await page.goto('http://localhost:5174/');
  await page.evaluate(() => {
    localStorage.setItem('dToken', 'mock-doc-token');
    localStorage.setItem('profileData', JSON.stringify({_id: 'doc1'}));
  });
  
  await page.goto('http://localhost:5174/patient/PAT001');
  await wait(2000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/patient_detail_session.png` });

  await browser.close();
})();

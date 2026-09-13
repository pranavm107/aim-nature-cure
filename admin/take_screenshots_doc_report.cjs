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

  // Navigate to Doctor Daily Report
  await page.goto('http://localhost:5174/doctor/daily-report');
  await wait(2000);
  
  // Check if today is already submitted by looking for the "Add Note" button
  // If it's the New Report form, fill it out
  const inputs = await page.$$('input[type="number"]');
  if (inputs.length > 0) {
    // Fill form
    await inputs[0].type('12');
    await inputs[1].type('6');
    await inputs[2].type('6');
    await inputs[3].type('2');

    const textareas = await page.$$('textarea');
    if (textareas.length > 0) {
      await textareas[0].type('Excellent day, all therapies completed on time.');
    }

    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Submit Report')) {
        await btn.click();
        break;
      }
    }
    
    await wait(2000); // Wait for submit
  }

  // Now we should be on the locked view. Add an addendum!
  const addendumTextareas = await page.$$('textarea');
  if (addendumTextareas.length > 0) {
    await addendumTextareas[0].type('Late follow-up patient arrived at 5 PM, handled smoothly.');
    
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Add Note')) {
        await btn.click();
        break;
      }
    }
    await wait(2000); // Wait for note to be added
  }

  // Scroll down a bit
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  await wait(500);

  // Take screenshot
  await page.screenshot({ path: `${ARTIFACT_DIR}/doctor_report_locked.png` });

  // Optional: Also screenshot a past submission
  const pastItems = await page.$$('div.cursor-pointer');
  if (pastItems.length > 1) {
    await pastItems[pastItems.length - 1].click(); // Click an older report
    await wait(1000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/doctor_report_past.png` });
  }

  await browser.close();
})();

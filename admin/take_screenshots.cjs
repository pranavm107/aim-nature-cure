const puppeteer = require('puppeteer');
const fs = require('fs');
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const ARTIFACT_DIR = 'C:/Users/prana/.gemini/antigravity-ide/brain/96308e89-9242-48d8-a5b5-b90507c45ec9';

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } });
  const page = await browser.newPage();
  
  // Set tokens
  await page.goto('http://localhost:5174/');
  await page.evaluate(() => {
    localStorage.setItem('aToken', 'mock-admin-token');
    localStorage.setItem('adminPermissions', JSON.stringify(['manage_users', 'manage_roles', 'view_patients', 'edit_patients', 'manage_appointments', 'manage_therapies', 'view_reports', 'manage_billing']));
  });

  // 1. UserDetail view + edit modal
  await page.goto('http://localhost:5174/admin/users/u2');
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/user_detail.png` });
  
  let editBtns = await page.$$('button');
  for(let btn of editBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if(text.includes('Edit User') || text.includes('Edit')) {
      await btn.click();
      break;
    }
  }
  await wait(500);
  await page.screenshot({ path: `${ARTIFACT_DIR}/user_edit_modal.png` });

  // 2. AppointmentDetail view + edit modal (Completed-lock rule)
  await page.goto('http://localhost:5174/admin/appointments/app2');
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/appointment_detail_completed.png` });
  
  let appEditBtns = await page.$$('button');
  for(let btn of appEditBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if(text.includes('Edit') || text.includes('Edit Appointment')) {
      await btn.click();
      break;
    }
  }
  await wait(500);
  await page.screenshot({ path: `${ARTIFACT_DIR}/appointment_edit_modal_locked.png` });

  // 3. Therapies Add/Edit modal
  await page.goto('http://localhost:5174/admin/therapies');
  await wait(1000);
  let thBtns = await page.$$('button');
  for(let btn of thBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if(text.includes('Add Therapy') || text.includes('Add')) {
      await btn.click();
      break;
    }
  }
  await wait(500);
  await page.screenshot({ path: `${ARTIFACT_DIR}/therapies_add_modal.png` });

  // 4. PackageForm
  await page.goto('http://localhost:5174/admin/packages/add');
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/package_form.png` });

  // 5. PackageDetail
  await page.goto('http://localhost:5174/admin/packages/pkg1');
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/package_detail.png` });

  // 6. Patient Detail (Mark Session Attended + periodOfDays)
  await page.evaluate(() => {
    localStorage.setItem('dToken', 'mock-doc-token');
    localStorage.setItem('profileData', JSON.stringify({_id: 'doc1'}));
  });
  await page.goto('http://localhost:5174/patient/PAT001');
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/patient_detail_session.png` });

  // 7. Follow-Ups module (list view)
  await page.goto('http://localhost:5174/admin/follow-ups');
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/follow_ups_list.png` });

  // 8. NotificationsPanel
  const bellIcon = await page.$('svg.lucide-bell');
  if (bellIcon) await bellIcon.click();
  await wait(500);
  await page.screenshot({ path: `${ARTIFACT_DIR}/notifications_panel.png` });

  // 9. Daily Report date-level View Page
  await page.goto('http://localhost:5174/admin/daily-reports');
  await wait(1000);
  let repBtns = await page.$$('button');
  for(let btn of repBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if(text.includes('View Details')) {
      await btn.click();
      break;
    }
  }
  await wait(1000);
  await page.screenshot({ path: `${ARTIFACT_DIR}/daily_report_date_level.png` });

  await browser.close();
})();

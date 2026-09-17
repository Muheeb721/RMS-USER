import { chromium } from 'playwright';
const email = `liveuser${Date.now()}@example.com`;
const password = 'Password123!';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  const reg = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Live User', email, password, phone: '+923001234567' })
  });
  const regJson = await reg.json();
  console.log('REG=' + reg.status + ' success=' + regJson.success);

  await page.goto('http://localhost:5175/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('input[placeholder="Enter your email"]', { timeout: 20000 });
  await page.fill('input[placeholder="Enter your email"]', email);
  await page.fill('input[placeholder="Enter your password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  const data = await page.evaluate(() => ({
    url: window.location.href,
    token: localStorage.getItem('rms_token'),
    session: localStorage.getItem('rms_auth_session'),
    role: localStorage.getItem('rms_user_role'),
    rawKeys: Object.keys(localStorage).filter(k => /rms|auth/i.test(k))
  }));
  console.log(JSON.stringify(data, null, 2));
} catch (e) {
  console.error('FAIL=' + e.message);
} finally {
  await browser.close();
}

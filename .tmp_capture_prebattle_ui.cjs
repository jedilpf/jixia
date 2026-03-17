const { chromium } = require('playwright');

(async () => {
  const executablePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const base = 'http://127.0.0.1:5180/?newFlow=1';

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/ui-prebattle-pass-20260317/01-home.png', fullPage: true });

  await page.getByRole('button', { name: '开始对战' }).click();
  await page.waitForTimeout(900);
  await page.mouse.click(12, 12);
  await page.waitForTimeout(1200);
  await page.waitForSelector('text=正在匹配对手', { timeout: 15000 });
  await page.screenshot({ path: 'screenshots/ui-prebattle-pass-20260317/02-match.png', fullPage: true });

  await page.getByRole('button', { name: '继续' }).click();
  await page.waitForSelector('text=选择论场', { timeout: 15000 });
  await page.screenshot({ path: 'screenshots/ui-prebattle-pass-20260317/03-topic.png', fullPage: true });

  await page.getByRole('button', { name: '继续' }).click();
  await page.waitForSelector('text=门派抉择', { timeout: 15000 });
  await page.screenshot({ path: 'screenshots/ui-prebattle-pass-20260317/04-faction-pick.png', fullPage: true });

  const firstFaction = page.locator('div.mt-5.grid.grid-cols-2.gap-4 > button').first();
  await firstFaction.click();
  await page.getByRole('button', { name: '确认门派' }).click();
  await page.waitForSelector('text=战前整备', { timeout: 15000 });
  await page.screenshot({ path: 'screenshots/ui-prebattle-pass-20260317/05-loading.png', fullPage: true });

  await browser.close();
})();

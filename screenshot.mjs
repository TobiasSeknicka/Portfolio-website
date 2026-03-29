import puppeteer from "puppeteer";
import { existsSync, mkdirSync } from "fs";
import { readdirSync } from "fs";
import { join } from "path";

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] ? `-${process.argv[3]}` : "";
const dir = "./temporary screenshots";

if (!existsSync(dir)) mkdirSync(dir);

const existing = readdirSync(dir).filter(f => f.startsWith("screenshot-")).length;
const n = existing + 1;
const filename = join(dir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle0" });

// Scroll through page to trigger all ScrollTrigger animations
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
const step = 300;
for (let y = 0; y <= pageHeight; y += step) {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  await new Promise(r => setTimeout(r, 150));
}
// Wait for all animations to finish (stagger + duration = up to 2s)
await new Promise(r => setTimeout(r, 2200));
// Scroll back to top
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));

await page.screenshot({ path: filename, fullPage: true });
await browser.close();

console.log(`Saved: ${filename}`);

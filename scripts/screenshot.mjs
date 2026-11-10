import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const outDir = path.resolve("screenshots");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });

async function shot(name, waitMs = 1200) {
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
  console.log(`Saved ${name}.png`);
}

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await shot("01-home-nouns");

await page.getByText("Action Verbs").click();
await shot("02-home-verbs");

await page.getByText("ABC Alphabet").click();
await shot("03-home-abc");

await page.goto("http://localhost:3000/phonics", { waitUntil: "networkidle" });
await shot("04-phonics", 1800);

await page.goto("http://localhost:3000/sentences", { waitUntil: "networkidle" });
await shot("05-sentences", 1800);

await browser.close();

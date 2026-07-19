import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1800 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(project, "web", "index.html")).href, { waitUntil: "load" });
await page.screenshot({ path: path.join(project, "outputs", "AquaSaveAI_app_screenshot.png"), fullPage: true });
await browser.close();

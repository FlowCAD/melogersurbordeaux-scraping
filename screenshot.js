const puppeteer = require("puppeteer");

const myUrl = 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/';

const getScreenshot = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(myUrl)
  await page.screenshot({ path: "screenshot.png" })
  await browser.close()
}

getScreenshot()
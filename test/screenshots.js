const puppeteer = require('puppeteer');
const sites = require('./../sites');

 
module.exports.screenCapture = (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto("https://example.com");
  var data = await page.screenshot({encoding: 'base64', fullPage: true});

  await browser.close();

  return data;
})();


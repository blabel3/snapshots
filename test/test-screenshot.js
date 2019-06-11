const puppeteer = require('puppeteer');
const sites = require("./sites.json");

 
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  for(i = 0; i < sites.length; i++){
    let filename = 'example' + i + '.png'
    await page.goto(sites[i]);
    await page.screenshot({path: filename, fullPage: true});
    console.log(i);
  }
 
  await browser.close();
})();

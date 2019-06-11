const puppeteer = require('puppeteer');
const sites = require('./../sites');

 
module.exports.run = (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  for(i = 0; i < sites.length; i++){
    let filename = 'test/example' + i + '.png'
    await page.goto(sites[i]);
    await page.screenshot({path: filename, fullPage: true});
    process.stdout.write(`${i}... `);
  }

  await browser.close();
})();

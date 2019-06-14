const puppeteer = require('puppeteer');
const sites = require('./../sites');

let goToSites = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
    
  process.stdout.write('      ');
  for(i = 0; i < sites.length; i++){
    process.stdout.write(`Site ${i}... `);
    try { 
      await page.goto(sites[i]);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  console.log();

  await browser.close();

  return true;
}

let screenCapture = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  await page.goto("https://example.com");
  var data = await page.screenshot({encoding: 'base64', fullPage: true});

  await browser.close();

  return data;
}

module.exports.goToSites = goToSites;

module.exports.screenCapture = screenCapture;
 

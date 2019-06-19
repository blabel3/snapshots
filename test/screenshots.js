//Internal dependencies
const paths = require('../data/paths');
//external dependencies
const puppeteer = require('puppeteer');

let goToSites = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
    
  process.stdout.write('      ');
  for(i = 0; i < paths.length; i++){
    process.stdout.write(`Site ${i}... `);
    try { 
      await page.goto("https://www.barrons.com" + paths[i]);
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

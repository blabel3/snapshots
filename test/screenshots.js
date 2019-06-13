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

  var data;

  //Takes screenshot
  puppeteer.launch().then( browser => {

    browser.newPage().then( page => {

      page.goto("https://example.com").then( () => {

        page.screenshot({encoding: 'base64', fullPage: true}).then( screenshot => {
          data = screenshot;
        });

      });

    })
    browser.close().then();

  });

  return data;
}

module.exports.goToSites = goToSites;

module.exports.screenCapture = screenCapture;
 

//Internal dependencies
const paths = require('../data/paths');
//external dependencies
const puppeteer = require('puppeteer');

const goToSites = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  const sites = Object.entries(paths)

  for (let domainIndex = 0; domainIndex < sites.length; domainIndex++) {
    const domain = `https://www.${sites[domainIndex][0]}.com`
    const pages = sites[domainIndex][1]

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      process.stdout.write(`      Going to ${domain}/${pages[pageIndex]}... `)
      page.goto(`${domain}/${pages[pageIndex]}`, {
        waitUntil: 'load',
        timeout: 0
      }).then( console.log('✓ Done!') )
        .catch( error => { return false })
    }
  }
  await browser.close();

  return true;
}

const screenCapture = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  
  await page.goto("https://example.com");
  var data = await page.screenshot({encoding: 'base64', fullPage: true});

  await browser.close();

  return data;
}

module.exports.goToSites = goToSites;
module.exports.screenCapture = screenCapture;

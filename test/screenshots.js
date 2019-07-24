// External dependencies
const puppeteer = require('puppeteer')

const screenCapture = async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  await page.goto('https://example.com')
  var data = await page.screenshot({ encoding: 'base64', fullPage: true })

  await browser.close()

  return data
}

module.exports.screenCapture = screenCapture

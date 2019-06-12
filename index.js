'use strict';

const puppeteer = require('puppeteer');
const sites = require('./sites');

module.exports.handler = async (event) => {

  //Takes screenshot
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for(i = 0; i < sites.length; i++){
    let filename = 'example' + i + '.png'
    await page.goto(sites[i]);
    await page.screenshot({path: filename, fullPage: true}); //should probably keep as buffer instead
    process.stdout.write(`${i}... `);
  }

  await browser.close();

  //Stores them

  //Gets CSS/HTML/JS 

  //Stores that
};

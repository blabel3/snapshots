'use strict';

const puppeteer = require('puppeteer');
const sites = require('./sites');

module.exports.screenshot = async (event) => {

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

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Screenshots taken! Yay.',
      input: event,
    }, null, 2),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.archiveFiles = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

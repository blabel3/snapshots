'use strict';

const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const sites = require('./sites');
const files = require('./files');

//Set up all AWS services we need to access from here
let s3 = new aws.S3({
  apiVersion: '2006-03-01', //latest as of 2019-06-13, but don't want to use latest in case anything changes.
  region: 'us-east-1', 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports.handler = async (event) => {

  //Takes screenshot
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for(i = 0; i < sites.length; i++){
    let filename = 'example' + i + '.png'
    await page.goto(sites[i]);
    let screenshot = await page.screenshot({fullPage: true});
    process.stdout.write(`${i}... `);
    
    //Stores them in s3
    let filename = "Barrons" + sites[i].substring(23) + "/screenshots"; // ex. Barrons/penta/screenshots

    let screenshotStoreParams = {
      Body: screenshot,
      Bucket: process.env.SAVE_BUCKET,
      Key: filename
    }

    s3.putObject(screenshotStoreParams, function(error, data){
      if (error) console.error(error); 
      else {
        console.log(data); //Will be stuff like the Etag and the versionID. 
      }
    })
  }

  await browser.close();

  //Gets CSS/HTML/JS 

  for(let filename in files){

    let fetchParams = {
      Bucket: process.env.FETCH_BUCKET,
      Key: filename
    }

    s3.getObject(fetchParams, function(error, resource) {
      if (error) console.error(error);
      else {
        //Object recieved!
        //Store object in storage bucket

        let resourceStoreParams = {
          Body: resource,
          Bucket: process.env.SAVE_BUCKET,
          Key: filename //need to edit these?
        }
    
        s3.putObject(resourceStoreParams, function(error, data){
          if (error) console.error(error); 
          else {
            console.log(data); //Will be stuff like the Etag and the versionID. 
          }
        })

      }
    })

  }

};

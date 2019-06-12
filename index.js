'use strict';

const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const sites = require('./sites');

let s3 = new aws.S3();

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
    let filename = "Barrons" + sites[i].substring(23);

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

  

  process.env.SAVE_BUCKET;
  process.env.FETCH_BUCKET;

  //Gets CSS/HTML/JS 

  let fetchParams = {
    Bucket: process.env.FETCH_BUCKET,
    Key: "Filename.blahblah"
  }

  s3.getObject(fetchParams, function(error, data) {
    if (error) console.error(error);
    else {
      //Object recieved!
      //Store object in storage bucket

      //find all objects to put in storage
      for (blah in data){
        //store the objects
        let screenshotStoreParams = {
          Body: websiteResource,
          Bucket: process.env.SAVE_BUCKET,
          Key: filename //need to come up with these?
        }
    
        s3.putObject(screenshotStoreParams, function(error, data){
          if (error) console.error(error); 
          else {
            console.log(data); //Will be stuff like the Etag and the versionID. 
          }
        })

      }

    }
  })

};

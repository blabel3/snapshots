'use strict';

//Internal dependencies
const sites = require('./data/sites');
const files = require('./data/files');

//External dependencies
const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const express = require('express');

//Initilization
const app = express();

//Set up all AWS services we need to access from here
let s3 = new aws.S3({
  apiVersion: '2006-03-01', //latest as of 2019-06-13, but don't want to use latest in case anything changes.
  region: 'us-east-1', 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

//Servo required health check
app.get('/_health', (req, res) => {
  console.log('GET /_health 200');
  res.status(200).json({
    status: 'OK',
    app: 'snapshot-service',
    commit: process.env.SERVO_COMMIT
  })
})


// TODO: Work with express better!
app.get('/', async (req, res) => {

  //Takes screenshot
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  for(let i = 0; i < sites.length; i++){
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

  for(let file in files){

    let fetchParams = {
      Bucket: process.env.FETCH_BUCKET,
      Key: file
    }

    s3.getObject(fetchParams, function(error, resource) {
      if (error) console.error(error);
      else {
        //Object recieved!
        //Store object in storage bucket

        let resourceStoreParams = {
          Body: resource,
          Bucket: process.env.SAVE_BUCKET,
          Key: file //need to edit these?
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

})

//Binding to servo specified port
app.listen(process.env.PORT, () => {
  console.log(`Snapshot-Service listening on port ${process.env.PORT}...`);
});
'use strict';

//Internal dependencies
const paths = require('./data/paths');

//External dependencies
const http = require('http');
const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const express = require('express');
const axios = require('axios');
//let axios = 'yay'

//Initilization
const app = express();
const saveBucket = process.env.LOCAL ? "test-bucket" : process.env.SERVO_S3_BUCKET;

const host = "https://www.barrons.com";

//Set up all AWS services we need to access from here
let config = {
  apiVersion: '2006-03-01', //latest as of 2019-06-13, but don't want to use latest in case anything changes.
  region: 'us-east-1', 
  accessKeyId: process.env.SERVO_S3_KEY ? process.env.SERVO_S3_KEY : 'S3RVER',
  secretAccessKey: process.env.SERVO_S3_SECRET_KEY ? process.env.SERVO_S3_SECRET_KEY : 'S3RVER'
}

if(process.env.LOCAL) config.endpoint = "http://localhost:9001";

let s3 = new aws.S3(config);

console.log(saveBucket);
console.log(process.env.LOCAL);
console.log(config);

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

  let dateAppend;

  //Takes screenshot
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  for(let i = 0; i < paths.length; i++){
    await page.goto(host + paths[i]);
    let screenshot = await page.screenshot({fullPage: true});
    process.stdout.write(`${i}... `);

    console.log(screenshot);
    
    //Stores them in s3
    var d = new Date();
    dateAppend = d.getUTCFullYear() + "/" + d.getUTCMonth() + "/" + d.getUTCDate();
    let filename = "Barrons/" + dateAppend + paths[i] + "screenshots/" + "shot" + ".png"; // ex. Barrons/penta/screenshots

    let screenshotStoreParams = {
      Body: screenshot,
      Bucket: saveBucket,
      Key: filename,
      ContentType: "image/png"
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

  let requests = [];

  //Set up all requests we need
  for(let i = 0; i < paths.length; i++){

    console.log(paths[i])

    let request = axios.get((host + paths[i]), {
      headers: { 'CF-CACHE-TAG': process.env.CF_CACHE_TAG }
    });

    requests.push(request);

  }

  //Run all requests simultaneously then work with the responses.
  Promise.all(requests).then( (responses) => {

    for(let i = 0; i < responses.length; i++){
      console.log(responses[i].status);

      let resourceStoreParams = {
        Body: responses[i].data,
        Bucket: saveBucket,
        Key: "Barrons/" + dateAppend  + paths[i] + "resources/" + "index.html" //need to edit these?
      }

      s3.putObject(resourceStoreParams, function(error, data){
        if (error) console.error(error); 
        else {
          console.log(data); //Will be stuff like the Etag and the versionID. 
        }
      })
    }

  }).then(() => { res.send('<p>Done!</p>') });

});

//Binding to servo specified port
app.listen(process.env.PORT, () => {
  console.log(`Snapshot-Service listening on port ${process.env.PORT}...`);
});
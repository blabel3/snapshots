//Internal dependencies
const paths = require('./data/paths');

//External dependencies
const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const axios = require('axios');

//Initilization 
const saveBucket = process.env.SERVO_S3_BUCKET;
const bucketPrefix = process.env.SERVO_S3_KEY_PREFIX;
const host = "https://www.barrons.com";

let d = new Date();
let dateAppend = d.getUTCFullYear() + "/" + d.getUTCMonth() + "/" + d.getUTCDate();

//AWS Initilizarion
let config = {
  apiVersion: '2006-03-01', //latest as of 2019-06-13, but don't want to use `latest~ in case anything changes.
  region: process.env.AWS_REGION, 
}

//Setting stuff differently in order to run locally
if(!process.env.SERVO_S3_BUCKET) {
    config.endpoint = 'http://localhost:9001';
    config.region = 'us-east-1';
    config.accessKeyId = 'S3RVER';
    config.secretAccessKey = 'S3RVER';
    saveBucket = 'test-bucket';
    bucketPrefix = '';
}

let s3 = new aws.S3(config);

//get screenshots
let browser = async () => {

    //debugging
    console.log("SAVE BUCKET: " + saveBucket);
    console.log("BUCKET PREFIX: " + bucketPrefix);

    //Takes screenshot
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    for(let i = 0; i < paths.length; i++){
        await page.goto(host + paths[i]);
        let screenshot = await page.screenshot({fullPage: true});
        process.stdout.write(`${i}... `);

        console.log(screenshot);

        let filename = "Barrons/" + dateAppend + paths[i] + "screenshots/" + "shot" + ".png"; // ex. Barrons/penta/screenshots
        let key = bucketPrefix + filename;

        let screenshotStoreParams = {
            Body: screenshot,
            Bucket: saveBucket,
            Key: key,
            ContentType: "image/png"
        }

        s3.putObject(screenshotStoreParams, function(error, data){
            if (error) console.error(error); 
            else {
            console.log(data); //Will be stuff like the Etag and the versionID. 
            }
        })

    }

    s3.listObjects( { Bucket: saveBucket }, (error, data) => {
        if(error) console.error(error);
        console.log(data);
    })

    await browser.close();

};

//Get other site files
let resources = () => {
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

        let filename = "Barrons/" + dateAppend  + paths[i] + "resources/" + "index.html";
        let key = bucketPrefix + filename;

        let resourceStoreParams = {
        Body: responses[i].data,
        Bucket: saveBucket,
        Key:  key//need to edit these?
        }

        s3.putObject(resourceStoreParams, function(error, data){
        if (error) console.error(error); 
        else {
            console.log(data); //Will be stuff like the Etag and the versionID. 
        }
        })
    }

    s3.listObjects( { Bucket: saveBucket }, (error, data) => {
        if(error) console.error(error);
        console.log(data);
    })

    }).then(() => { console.log('Yay!') });
}

browser().then( (result) => {
    resources();
} );
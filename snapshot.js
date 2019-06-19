//Internal dependencies
const paths = require('./data/paths');

//External dependencies
const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const axios = require('axios');

//Initilization 
const saveBucket = process.env.LOCAL ? "test-bucket" : process.env.SERVO_S3_BUCKET;
const host = "https://www.barrons.com";

let d = new Date();
let dateAppend = d.getUTCFullYear() + "/" + d.getUTCMonth() + "/" + d.getUTCDate();

//AWS Initilizarion
let config = {
  apiVersion: '2006-03-01', //latest as of 2019-06-13, but don't want to use `latest~ in case anything changes.
  region: process.env.AWS_REGION ? process.env.AWS_REGION : 'us-east-1', 
  accessKeyId: process.env.SERVO_S3_KEY ? process.env.SERVO_S3_KEY : 'S3RVER',
  secretAccessKey: process.env.SERVO_S3_SECRET_KEY ? process.env.SERVO_S3_SECRET_KEY : 'S3RVER'
}
if(process.env.LOCAL) config.endpoint = "http://localhost:9001";
let s3 = new aws.S3(config);

//debugging
console.log(saveBucket);
console.log(process.env.LOCAL);
console.log(config);

//get screenshots
let browser = async () => {

    //Takes screenshot
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    for(let i = 0; i < paths.length; i++){
        await page.goto(host + paths[i]);
        let screenshot = await page.screenshot({fullPage: true});
        process.stdout.write(`${i}... `);

        console.log(screenshot);


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

    }).then(() => { console.log('Yay!') });
}

browser().then( (result) => {
    resources();
} );
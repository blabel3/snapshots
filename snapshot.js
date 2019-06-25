//Internal dependencies
const paths = require('./data/paths');

//External dependencies
const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const axios = require('axios');
const zip = require('jszip');
const fs = require('fs');

//Initilization 
let saveBucket = process.env.SERVO_S3_BUCKET;
let bucketPrefix = process.env.SERVO_S3_KEY_PREFIX;
const host = "https://www.barrons.com";

let d, dateAppend;
var zipper = new zip();

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

        let key = `${bucketPrefix}Barrons/${dateAppend}${paths[i]}screenshots/shot.png`; // ex. Barrons/penta/screenshots

        console.log(`SKEY: ${key}`);

        let screenshotStoreParams = {
            Body: screenshot,
            Bucket: saveBucket,
            Key: key,
            ContentType: "image/png"
        }

        s3.putObject(screenshotStoreParams, (error, data) => {
            if (error) console.error(error); 
            else {
            console.log(data); //Will be stuff like the Etag and the versionID. 
            }
        });

    }

    await browser.close();

};

//Get other site files
let resources = () => {
    //Gets CSS/HTML/JS 

    //debugging
    console.log("SAVE BUCKET: " + saveBucket);
    console.log("BUCKET PREFIX: " + bucketPrefix);

    let requests = [];

    //Set up all requests we need
    for(let i = 0; i < paths.length; i++){

    console.log(paths[i])

    let request = axios.get((host + paths[i]), {
        headers: { 'CF-CACHE-TAG': process.env.CF_CACHE_TAG ? process.env.CF_CACHE_TAG : 'test' }
    });

    requests.push(request);

    }

    //Run all requests simultaneously then work with the responses.
    Promise.all(requests).then( (responses) => {

    for(let i = 0; i < responses.length; i++){
        console.log(responses[i].status);

        let key = `${bucketPrefix}Barrons/${dateAppend}${paths[i]}resources/index.html`;

        console.log(`RKEY: ${key}`);

        let resourceStoreParams = {
            Body: responses[i].data,
            Bucket: saveBucket,
            Key:  key, 
            ContentType: "text/html"
        }

        s3.putObject(resourceStoreParams, (error, data) => {
        if (error) console.error(error); 
        else {
            console.log(data); //Will be stuff like the Etag and the versionID. 
        }
        })
    }

    }).then(() => { 

        console.log('Yay!') 
    });
}

let formatDate = (date) => {
    return `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDate()}`;
}

module.exports.takeSnapshot = async () => {
    d = new Date();
    dateAppend = formatDate(d);
    await browser();
    resources();
}

module.exports.checkFiles = () => {

    if( false ) { //we have a date passed in

    } else {
        d = new Date();
        dateAppend = formatDate(d);
    }

    console.log(bucketPrefix);

    let params = { 
        Bucket: saveBucket,
        StartAfter: bucketPrefix
     }

    s3.listObjectsV2(params, (error, data) => {
        if(error) console.error(error);
        console.log(data);
    });
}

module.exports.getFiles = () => {

    console.log(bucketPrefix);

    if( false ) { //we have a date passed in

    } else {
        d = new Date();
        dateAppend = formatDate(d);
    }

    let snapshotZip = zipper.folder(`Barrons/${dateAppend}`.replace(/\//g, "-"));
    let endpoints = ["resources/index.html", "screenshots/shot.png"];

    let getRequests = [];

    for(let i =0; i < paths.length; i++){

        for(let j=0; j < endpoints.length; j++){

            let key = `${bucketPrefix}Barrons/${dateAppend}${paths[i]}${endpoints[j]}`;
            console.log(key)

            let params = { 
                Bucket: saveBucket,
                Key: key
                //StartAfter: bucketPrefix + "Barrons"
            }
        
            let awsPromise = s3.getObject(params).promise();
            getRequests.push(awsPromise);

        }

    }

    Promise.all(getRequests).then( (responses) => {
        for(let i=0; i < responses.length; i++){

            let ref = i - Math.ceil(i / 2);
            console.log(ref);
            let filename = `${paths[ref].substring(1)}${endpoints[i % 2]}`;
            console.log(filename);
            console.log(responses[i]);

            snapshotZip.file(filename, responses[i].Body.toString());
        }

        snapshotZip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream('zippy.zip'))
        .on('finish', () => { console.log('Zippy is ready!') });
    })

}
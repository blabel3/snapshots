//Internal dependencies
const paths = require('./data/paths');
const endpoints = require('./data/endpoints');

//External dependencies
const async = require('async');
const fs = require('fs');
const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const axios = require('axios');
const zip = require('jszip');

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

    //Takes screenshot
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    for(let i = 0; i < paths.length; i++){
        process.stdout.write(`Screenshotting ${i} (${host}/${paths[i]})... `);
        await page.goto(`${host}/${paths[i]}`);
        console.log('✓ Done!');
        let screenshot = await page.screenshot({fullPage: true});
        
        let key = `${bucketPrefix}Barrons/${dateAppend}/${paths[i]}/${endpoints[0]}`; // ex. Barrons/penta/screenshots
        console.log(`  Screenshot KEY: ${key}`);

        let screenshotStoreParams = {
            Body: screenshot,
            Bucket: saveBucket,
            Key: key,
            ContentType: "image/png"
        }

        s3.putObject(screenshotStoreParams, (error, data) => {
            if (error) console.error(error); 
            //data is just the Etag and the versionID. We don't need to do anything with it.
        });

    }

    await browser.close();

};

//Gets CSS/HTML/JS 
let resources = () => {

    let requests = [];

    //Set up all requests we need
    for(let i = 0; i < paths.length; i++){

        let request = axios.get(`${host}/${paths[i]}`, {
            headers: { 'CF-CACHE-TAG': process.env.CF_CACHE_TAG ? process.env.CF_CACHE_TAG : 'test' }
        });

        requests.push(request);

    }

    console.log("Making all HTTP requests for resources...")

    //Run all requests simultaneously then work with the responses.
    Promise.all(requests).then( (responses) => {

        console.log("Resources obtained!");

        for(let i = 0; i < responses.length; i++){
            let key = `${bucketPrefix}Barrons/${dateAppend}/${paths[i]}/${endpoints[1]}`;

            console.log(`Storing file: ${key}`);

            let resourceStoreParams = {
                Body: responses[i].data,
                Bucket: saveBucket,
                Key:  key, 
                ContentType: "text/html"
            }

            s3.putObject(resourceStoreParams, (error, data) => {
                if (error) console.error(error); 
                //data is just the Etag and the versionID. We don't need to do anything with it.
            })
        }

    }).then(() => { 
        console.log('Snapshot taken!') 
    });
}

let formatDate = (date) => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

let saveJSON = (object, dateAppend, fileName) => {
    let saveParams = {
        Body: object.toString(),
        Bucket: saveBucket,
        Key: `${bucketPrefix}Barrons/${dateAppend}/${fileName}.json`,
        ContentType: "application/json"
    }

    s3.putObject(saveParams, (error, data) => {
        if (error) console.error(error); 
        //data is just the Etag and the versionID. We don't need to do anything with it.
    })
}

module.exports.takeSnapshot = async () => {
    d = new Date();
    dateAppend = formatDate(d);

    //debugging
    console.log("SAVE BUCKET: " + saveBucket);
    console.log("BUCKET PREFIX: " + bucketPrefix);

    console.log(paths);
    console.log(endpoints);

    saveJSON(paths, dateAppend, 'paths');
    saveJSON(endpoints, dateAppend, 'endpoints');

    await browser();
    resources();
}

//Sets variable from JSON data in S3 Bucket
let setZipPages = async (file, day, month, year) => {

    let params = {
        Bucket: saveBucket,
        Key: `${bucketPrefix}Barrons/${year}/${month}/${day}/${file}.json`
    }

    let promise = s3.getObject(params).promise();
    let recievedSettings = await promise;

    let settings = recievedSettings.Body.toString().split(",");

    console.log(settings);
    return settings;

}

module.exports.getFiles = async (day, month, year) => {

    console.log(bucketPrefix);

    let today = new Date();

    if(!day) day = d.getDate();
    if(!month) month = d.getMonth() + 1; 
    if(!year) year = d.getFullYear();

    //Get pages that were taken by the snapshot from S3.
    let snapshotPaths = await setZipPages('paths', day, month, year);
    let snapshotEndpoints = await setZipPages('endpoints', day, month, year);

    //Set up output zip.
    let foldername = `Barrons/${year}/${month}/${day}`.replace(/\//g, "-");
    let outputzip = foldername + ".zip";
    if(process.send) {
        process.send(outputzip);
        console.log("Sent output filename! :)");
    } else {
        console.log("Output file name not sent to parent. :(");
    }

    let snapshotZip = zipper.folder(foldername);
    let getRequests = [];

    for(let i =0; i < snapshotPaths.length; i++){

        for(let j=0; j < snapshotEndpoints.length; j++){

            let key = `${bucketPrefix}Barrons/${year}/${month}/${day}/${snapshotPaths[i]}/${snapshotEndpoints[j]}`;
            console.log(`Request: ${key}`)

            let params = { 
                Bucket: saveBucket,
                Key: key
            }
        
            let awsPromise = s3.getObject(params).promise();
            getRequests.push(awsPromise);

        }

    }

    Promise.all(getRequests).then( (responses) => {
        for(let i=0; i < responses.length; i++){

            let ref = i - Math.ceil(i / snapshotEndpoints.length); //Hits every path for each endpoint.
            let filename = `${snapshotPaths[ref]}/${snapshotEndpoints[i % snapshotEndpoints.length]}`;
            process.stdout.write(`Zipping ${filename}... `);

            snapshotZip.file(filename, responses[i].Body, {'binary': true}); //Screenshots and others can both be saved as binary.
            console.log('✓ Done!');
        }

        snapshotZip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(`${outputzip}`)
        .on('finish', () => { console.log(`${outputzip} is ready!`) }));
    })

}
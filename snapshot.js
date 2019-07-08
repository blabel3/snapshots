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

    //debugging
    console.log("SAVE BUCKET: " + saveBucket);
    console.log("BUCKET PREFIX: " + bucketPrefix);

    //Takes screenshot
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    for(let i = 0; i < paths.length; i++){
        await page.goto(`${host}/${paths[i]}`);
        let screenshot = await page.screenshot({fullPage: true});
        process.stdout.write(`${i}... `);

        console.log(screenshot);

        let key = `${bucketPrefix}Barrons/${dateAppend}/${paths[i]}/${endpoints[0]}`; // ex. Barrons/penta/screenshots

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

    let request = axios.get(`${host}/${paths[i]}`, {
        headers: { 'CF-CACHE-TAG': process.env.CF_CACHE_TAG ? process.env.CF_CACHE_TAG : 'test' }
    });

    requests.push(request);

    }

    //Run all requests simultaneously then work with the responses.
    Promise.all(requests).then( (responses) => {

    for(let i = 0; i < responses.length; i++){
        console.log(responses[i].status);

        let key = `${bucketPrefix}Barrons/${dateAppend}/${paths[i]}/${endpoints[1]}`;

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
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

module.exports.takeSnapshot = async () => {
    d = new Date();
    dateAppend = formatDate(d);
    await browser();
    resources();
}

module.exports.checkFiles = (day, month, year) => {

    console.log(bucketPrefix);

    d = new Date();

    if(!day) day = d.getUTCDate();
    if(!month) month = d.getUTCMonth() + 1; 
    if(!year) year = d.getUTCFullYear();

    let params = { 
        Bucket: saveBucket,
        StartAfter: bucketPrefix
     }

    /*s3.listObjectsV2(params, (error, data) => {
        if(error) console.error(error);
        console.log(data);
    });*/

    getObjectList('', (err, response) => {
        if (err) {
            console.error(err);
          } else {
            console.log(response);
          }
    }  );

}

function getObjectList (datePrefix, cb) {
  
    const listOptions = {
      Bucket: saveBucket,
      //Delimiter: '/',
      MaxKeys: 1000,
      Prefix: bucketPrefix + datePrefix
    };

    console.log(bucketPrefix + datePrefix);
    console.log(listOptions);
  
    s3.listObjectsV2(listOptions, function(err, data) {
      if (err) {
        console.error(err);
        return cb(err);
      }
      console.log(data);
      if (!data.Contents || data.Contents.length === 0) {
        if (data.CommonPrefixes.length) {
          async.map(data.CommonPrefixes, (subPrefix, next) => {
            let recursiveCall = getObjectList(subPrefix.Prefix.substring((bucketPrefix).length), (oErr, subData) => {
              next(null, subData);
            });
            console.log(recursiveCall);
          }, (mapErr, results) => {
            cb(null, _.flatten(results));
          });
        } else {
          cb(null, data.CommonPrefixes);
        }
      } else {
        cb(null, data.Contents);
      }
    });
}

module.exports.getFiles = (day, month, year) => {

    console.log(bucketPrefix);

    d = new Date();

    if(!day) day = d.getDate();
    if(!month) month = d.getMonth() + 1; 
    if(!year) year = d.getFullYear();

    let foldername = `Barrons/${year}/${month}/${day}`.replace(/\//g, "-");
    let outputzip = foldername + ".zip";
    if(process.send) {
        process.send(outputzip);
        console.log("Sent! :)");
    } else {
        console.log("Output file name not sent to parent. :(");
    }

    let snapshotZip = zipper.folder(foldername);
    let getRequests = [];

    for(let i =0; i < paths.length; i++){

        for(let j=0; j < endpoints.length; j++){

            let key = `${bucketPrefix}Barrons/${year}/${month}/${day}/${paths[i]}/${endpoints[j]}`;
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

            let ref = i - Math.ceil(i / endpoints.length); //Hits every path for each endpoint.
            console.log(ref);
            let filename = `${paths[ref]}/${endpoints[i % endpoints.length]}`;
            console.log(filename);
            console.log(responses[i]);

            snapshotZip.file(filename, responses[i].Body, {'binary': true}); //Screenshots and others can both be saved as binary.
        }


        snapshotZip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(`${outputzip}`)
        .on('finish', () => { console.log(`${outputzip} is ready!`) }));
    })

}

module.exports.getFile = {
  (day, month, year) => {

    console.log(bucketPrefix);

    d = new Date();

    if(!day) day = d.getDate();
    if(!month) month = d.getMonth() + 1; 
    if(!year) year = d.getFullYear();

    let foldername = `Barrons/${year}/${month}/${day}`.replace(/\//g, "-");
    let outputzip = foldername + ".zip";
    if(process.send) {
        process.send(outputzip);
        console.log("Sent! :)");
    } else {
        console.log("Output file name not sent to parent. :(");
    }

    let snapshotZip = zipper.folder(foldername);
    let getRequests = [];

    for(let i =0; i < paths.length; i++){

        for(let j=0; j < endpoints.length; j++){

            let key = `${bucketPrefix}Barrons/${year}/${month}/${day}/${paths[i]}/${endpoints[j]}`;
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

            let ref = i - Math.ceil(i / endpoints.length); //Hits every path for each endpoint.
            console.log(ref);
            let filename = `${paths[ref]}/${endpoints[i % endpoints.length]}`;
            console.log(filename);
            console.log(responses[i]);

            snapshotZip.file(filename, responses[i].Body, {'binary': true}); //Screenshots and others can both be saved as binary.
        }


        snapshotZip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(`${outputzip}`)
        .on('finish', () => { console.log(`${outputzip} is ready!`) }));
    })

}
}
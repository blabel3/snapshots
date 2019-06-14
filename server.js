'use strict'; //Internal dependencies

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const sites = require('./sites');

const files = require('./files'); //External dependencies


const puppeteer = require('puppeteer');

const aws = require('aws-sdk');

const express = require('express'); //Initilization


const app = express(); //Set up all AWS services we need to access from here

let s3 = new aws.S3({
  apiVersion: '2006-03-01',
  //latest as of 2019-06-13, but don't want to use latest in case anything changes.
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}); //Servo required health check

app.get('/_health', (req, res) => {
  console.log('GET /_health 200');
  res.status(200).json({
    status: 'OK',
    app: 'snapshot-service',
    commit: process.env.SERVO_COMMIT
  });
}); // TODO: Work with express better!

app.get('/',
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    //Takes screenshot
    const browser = yield puppeteer.launch();
    const page = yield browser.newPage();

    for (let i = 0; i < sites.length; i++) {
      yield page.goto(sites[i]);
      let screenshot = yield page.screenshot({
        fullPage: true
      });
      process.stdout.write(`${i}... `); //Stores them in s3

      let filename = "Barrons" + sites[i].substring(23) + "/screenshots"; // ex. Barrons/penta/screenshots

      let screenshotStoreParams = {
        Body: screenshot,
        Bucket: process.env.SAVE_BUCKET,
        Key: filename
      };
      s3.putObject(screenshotStoreParams, function (error, data) {
        if (error) console.error(error);else {
          console.log(data); //Will be stuff like the Etag and the versionID. 
        }
      });
    }

    yield browser.close(); //Gets CSS/HTML/JS 

    for (let file in files) {
      let fetchParams = {
        Bucket: process.env.FETCH_BUCKET,
        Key: file
      };
      s3.getObject(fetchParams, function (error, resource) {
        if (error) console.error(error);else {
          //Object recieved!
          //Store object in storage bucket
          let resourceStoreParams = {
            Body: resource,
            Bucket: process.env.SAVE_BUCKET,
            Key: file //need to edit these?

          };
          s3.putObject(resourceStoreParams, function (error, data) {
            if (error) console.error(error);else {
              console.log(data); //Will be stuff like the Etag and the versionID. 
            }
          });
        }
      });
    }
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); //Binding to servo specified port

app.listen(process.env.PORT, () => {
  console.log(`Snapshot-Service listening on port ${process.env.PORT}...`);
});
const S3rver = require('s3rver');
const aws = require('aws-sdk');

const assert = require('assert');


const config = {
    apiVersion: '2006-03-01', //latest as of 2019-06-13, but don't want to use latest in case anything changes.
    region: 'us-east-1', 
    accessKeyId: 'S3RVER',
    secretAccessKey: 'S3RVER',
    endpoint: 'http://localhost:4568'
  }
  
let s3 = new aws.S3(config);

let putImageInBucket = (content, done) => {

    let storeParams = {
        Body: content,
        Bucket: 'test-bucket',
        Key: 'example.png',
        ContentType: 'image/png'
    }

    s3.putObject(storeParams, function(error, data){
        assert(!error, true);

        if (error) console.error(error); 

        done();

    })

}

module.exports.putImageInBucket = putImageInBucket;

module.exports.server = new S3rver({
    address: "127.0.0.1",
    port: 4568,
    directory: "/tmp/s3rver",
    configureBuckets : [ { name: "test-bucket" }],
    silent: true
});
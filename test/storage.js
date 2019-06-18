const S3rver = require('s3rver');
const aws = require('aws-sdk');

const config = {
    apiVersion: '2006-03-01', //latest as of 2019-06-13, but don't want to use latest in case anything changes.
    region: 'us-east-1', 
    accessKeyId: 'S3RVER',
    secretAccessKey: 'S3RVER',
    endpoint: 'http://localhost:4568'
  }
  
const s3 = new aws.S3(config);

let putInBucket = (content, test, done) => {

    let storeParams;


    if(content.length < 20000) { //It's a file
        storeParams = {
            Body: content,
            Bucket: 'test-bucket',
            Key: 'example.html',
            ContentType: 'text/html'
        }
    } else { //It's a screenshot
        storeParams = {
            Body: content,
            Bucket: 'test-bucket',
            Key: 'example.png',
            ContentType: 'image/png'
        }
    }

    s3.putObject(storeParams, function(error, data){
        test(error);
        if (error) console.error(error); 
        done();

    })

}

module.exports.putInBucket = putInBucket;

module.exports.server = new S3rver({
    address: "127.0.0.1",
    port: 4568,
    directory: "/tmp/s3rver",
    configureBuckets : [ { name: "test-bucket.localhost" }],
    silent: true
});
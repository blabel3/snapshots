const screenshots = require('./screenshots');
const assert = require('assert');
const control = require('./control');

describe('Screenshots', function() {
    describe('Takes screenshot', function(){
        it('Reaches all of the websites in sites.json', async function() {
            this.timeout(0); //Perhaps adjust after we know a ballpark for the sites instead of disabling
            let reachable = await screenshots.goToSites();
            assert.equal(reachable, control.reachable);
        });
        
        it('Takes a screenshot of a webpage', async function() {
            let screenshot = await screenshots.screenCapture();
            assert.equal(screenshot, control.screenshot);
        });
    });
    //TODO: Write tests for storage.
    describe('Stores screenshot', function(){
        it('Accesses storage S3 bucket', function(){

        });

        it('Uploads to storage S3 bucket', function() {

        });
    });
});

//TODO: Write tests for File getter.
describe('Resources (HTML/CSS/JS)', function(){
    describe("Gets files from website's S3 bucket", function() {
        it('Accesses S3 bucket', function(){

        });

        it('Gets files from S3 Bucket', function(){

        });
    });

    describe("Puts files into storage S3 bucket", function(){
        it('Accesses storage S3 bucket', function(){

        });

        it('Puts files into storage S3 bucket', function(){

        });
    });
});

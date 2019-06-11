const screenshots = require('./screenshots');
const assert = require('assert');
const control = require('./control');

describe('Screenshots', function() {
    describe('Takes screenshot', function(){
        it('can reach all of the websites in sites.json', async function() {
            this.timeout(0); //Perhaps adjust after we know a ballpark for the sites/
            let reachable = await screenshots.goToSites();
            assert.equal(reachable, control.reachable);
        });
        
        it('can take a screenshot of a webpage', async function() {
            let screenshot = await screenshots.screenCapture();
            assert.equal(screenshot, control.screenshot);
        });
    });
});

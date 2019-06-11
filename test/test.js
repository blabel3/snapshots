const screenshots = require('./screenshots');
const assert = require('assert');
const control = require('./control');

describe('Screenshots', function() {
    describe('Takes screenshot', function(){
        /*it('should reach all of the websites in sites.json', async function() {
            let reachable = await screenshots.goToSites;
            assert.equal(reachable, control.reachable);
        });*/
        
        it('should get the same data as the control screenshot here', async function() {
            let screenshot = await screenshots.screenCapture;
            assert.equal(screenshot, control.screenshot);
        });
    })
})

// Internal dependencies
const links = require('./link-check')
const screenshots = require('./screenshots')
const storage = require('./storage')
const control = require('../data/test-constants')

// External dependencies
const assert = require('assert').strict

describe('Snapshot taking', function () {
  describe('Websites are accessible', function () {
    it('Reaches all of the websites in paths.json', async function () {
      this.slow(50)
      this.timeout(0) // Perhaps adjust after we know a ballpark for the sites instead of disabling
      const reachable = await links.goToSites()
      assert.equal(reachable, control.reachable)
    })
  })

  describe('Takes snapshot', function () {
    before(function (done) {
      storage.server.run(done) // start server
    })

    it('Takes a screenshot of a webpage', async function () {
      this.slow(1000)
      const screenshot = await screenshots.screenCapture()
      try {
        assert.equal(screenshot.toString(), control.screenshot2)
      } catch (error) {
        // try the other screenshot from inside the docker image
        assert.equal(screenshot.toString(), control.screenshot)
      }
    })

    it('Stores screenshot', async function () {
      this.slow(50)
      assert.equal(true, await storage.putInBucket(control.screenshot2))
    })

    it('Stores html files', async function () {
      this.slow(10)
      assert.equal(true, await storage.putInBucket(control.html))
    })
  })
})

// TODO: Write tests for File getter.
describe('Sending snapshot to user', function () {
  describe('Gets files from storage', function () {
    it('Gets screenshot', async function () {
      this.slow(15)
      const screenshot = await storage.getFromBucket(control.screenshotKey)
      assert.equal(screenshot.toString(), control.screenshot2)
    })

    it('Gets html file', async function () {
      this.slow(7)
      const html = await storage.getFromBucket(control.htmlKey)
      assert.equal(html.toString(), control.html)
    })
  })

  after(function (done) {
    storage.server.close(done) // end server
  })
})

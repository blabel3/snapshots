// Internal dependencies
const paths = require('./data/paths')
const endpoints = require('./data/endpoints')
const breakpoints = require('./data/breakpoints')
const getDisplayName = require('./data/display-names').getDisplayName

// External dependencies
const fs = require('fs')
const puppeteer = require('puppeteer')
const aws = require('aws-sdk')
const axios = require('axios')
const Zip = require('jszip')

// Initilization
let saveBucket = process.env.SERVO_S3_BUCKET
let bucketPrefix = process.env.SERVO_S3_KEY_PREFIX

let d, dateAppend
var zipper = new Zip()

// AWS Initilizarion
const config = {
  apiVersion: '2006-03-01', // latest as of 2019-06-13, but don't want to use `latest~ in case anything changes.
  region: process.env.AWS_REGION
}

// Setting stuff differently in order to run locally
if (!process.env.SERVO_S3_BUCKET) {
  config.endpoint = 'http://localhost:9001'
  config.region = 'us-east-1'
  config.accessKeyId = 'S3RVER'
  config.secretAccessKey = 'S3RVER'
  saveBucket = 'test-bucket'
  bucketPrefix = ''
}

const s3 = new aws.S3(config)

const formatDate = date => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

// Sets variable from JSON data in S3 Bucket
const getData = async (file, day, month, year, domainDisplayName) => {
  const key = `${bucketPrefix}${domainDisplayName}/${year}/${month}/${day}/${file}`
  const params = {
    Bucket: saveBucket,
    Key: key
  }

  console.log(key)

  const promise = s3
    .getObject(params)
    .promise()
    .catch(error => { return error })
  return promise
}

const uploadFile = (body, key) => {
  const extension = key.substring(key.indexOf('.'))
  let contentType
  switch (extension) {
    case '.html':
      contentType = 'text/html'
      break
    case '.js':
      contentType = 'text/javascript'
      break
    case '.css':
      contentType = 'text/css'
      break
    case '.png':
      contentType = 'image/png'
      break
    case '.json':
      contentType = 'application/json'
      break
  }

  console.log(`  KEY: ${key}`)
  const saveParams = {
    Body: body,
    Bucket: saveBucket,
    Key: key,
    ContentType: contentType
  }

  s3.putObject(saveParams, (error, data) => {
    if (error) console.error(error)
    // data is just the Etag and the versionID. We don't need to do anything with it.
  })
}

// Get screenshots
const browser = async () => {
  // Takes screenshot
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  const sites = Object.entries(paths)
  const numOfBreakpoints = Object.entries(breakpoints).length

  for (let domainIndex = 0; domainIndex < sites.length; domainIndex++) {
    const domain = `https://www.${sites[domainIndex][0]}.com`
    const domainDisplayName = getDisplayName(sites[domainIndex][0])

    const pages = sites[domainIndex][1]

    console.log(domain)
    console.log(pages)

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const breakpointNames = Object.keys(breakpoints)
      const breakpointWidths = Object.values(breakpoints)

      for (let breakpointIndex = 0; breakpointIndex < numOfBreakpoints; breakpointIndex++) {
        // 4 breakpoints
        if(pages[pageIndex] === 'homepage'){
          process.stdout.write(`Screenshotting ${domain}... @${breakpointNames[breakpointIndex]} `)
        } else {
          process.stdout.write(`Screenshotting ${domain}/${pages[pageIndex]}... @${breakpointNames[breakpointIndex]} `)
        }
        await page.setViewport({
          width: breakpointWidths[breakpointIndex],
          height: 1080
        })
        if (pages[pageIndex] === 'homepage') {
          await page.goto(`${domain}/`, {
            waitUntil: process.env.NODE_ENV === 'production' ? 'networkidle0' : 'load',
            timeout: 0
          })
        } else {
          await page.goto(`${domain}/${pages[pageIndex]}`, {
            waitUntil: process.env.NODE_ENV === 'production' ? 'networkidle0' : 'load',
            timeout: 0
          })
        }
        console.log('✓ Done!')

        const screenshot = await page.screenshot({ fullPage: true })
        const key = `${bucketPrefix}${domainDisplayName}/${dateAppend}/${pages[pageIndex]}/${endpoints[breakpointIndex]}` // ex. Barrons/penta/screenshots

        uploadFile(screenshot, `${key}`)
      }
    }
  }

  await browser.close()
}

// Gets CSS/HTML/JS
const resources = () => {
  const requests = []
  const sites = Object.entries(paths)

  // Set up all requests we need
  for (let domainIndex = 0; domainIndex < sites.length; domainIndex++) {
    const domain = `https://www.${sites[domainIndex][0]}.com`
    const pages = sites[domainIndex][1]

    console.log(domain)
    console.log(pages)

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      let request
      if (pages[pageIndex] === 'homepage') {
        request = axios.get(`${domain}/`).catch(error => { return error })
      } else {
        request = axios.get(`${domain}/${pages[pageIndex]}`).catch(error => { return error })
      }
      requests.push(request)
    }
  }

  console.log('Making all HTTP requests for resources...')

  // Run all requests simultaneously then work with the responses.
  Promise.all(requests)
    .then(responses => {
      console.log('Resources obtained!')

      let domainIndex = 0
      let pageIndex = 0
      const domains = Object.keys(paths)

      for (let responseIndex = 0; responseIndex < responses.length; responseIndex++) {
        const pages = sites[domainIndex][1]
        const domainDisplayName = getDisplayName(domains[domainIndex])

        if (responses[responseIndex].data) {
          const key = `${bucketPrefix}${domainDisplayName}/${dateAppend}/${pages[pageIndex]}/${endpoints[endpoints.length - 1]}`
          uploadFile(responses[responseIndex].data, key)
        } else {
          console.error(`${domainDisplayName}'s site at ${pages[pageIndex]} didn't give us the HTML.`)
        }

        pageIndex++
        if (pageIndex >= Object.values(paths)[domainIndex].length) {
          pageIndex = 0
          domainIndex++
        }
      }
    })
    .then(() => {
      console.log('Snapshot taken!')
    })
}

module.exports.takeSnapshot = async () => {
  d = new Date()
  dateAppend = formatDate(d)

  // debugging
  console.log('SAVE BUCKET: ' + saveBucket)
  console.log('BUCKET PREFIX: ' + bucketPrefix)

  for (const [domain, pages] of Object.entries(paths)) {
    uploadFile(pages.toString(), `${bucketPrefix}${getDisplayName(domain)}/${dateAppend}/paths.json`)
    uploadFile(endpoints.toString(), `${bucketPrefix}${getDisplayName(domain)}/${dateAppend}/endpoints.json`)
    /* there will be multiples of these in each product's folder, this is because I decided to
        maintain compatibility with before I added in wsj and fnlondon. A beter way to do this
        would be to just put the paths and endpoints in the root of our bucket instead of
        putting it in each product's bucket. But it'd look worse for the demo, and it's a miniscule issue.
        */
  }

  await browser()
  resources()
}

module.exports.getFiles = async (day, month, year, product) => {
  console.log(bucketPrefix)

  const today = new Date()

  if (!day) day = today.getDate()
  if (!month) month = today.getMonth() + 1
  if (!year) year = today.getFullYear()

  if (!product) product = 'barrons' // Default to Barron's because we're the coolest :)

  // This is nasty but they're all different ugh.
  const displayName = getDisplayName(product)

  // Get pages that were taken by the snapshot from S3.
  // Could technically be optimized by returning promises and using promise.all but since it's two calls... prioritizing readability.
  let snapshotPages = await getData('paths.json', day, month, year, displayName)
    .catch(error => { return error })
  let snapshotEndpoints = await getData('endpoints.json', day, month, year, displayName)
    .catch(error => { return error })

  snapshotPages = snapshotPages.Body.toString().split(',')
  snapshotEndpoints = snapshotEndpoints.Body.toString().split(',')

  if (!Array.isArray(snapshotPages) || !Array.isArray(snapshotEndpoints)) {
    console.log('Data files were not found for this snapshot.')
    if (process.send) {
      process.send('Data not found')
    } else {
      console.log("Parent doesn't know how their kid is doing.. :(")
    }
    return 'ERROR: NO DATA'
  }

  // Set up output zip.
  const foldername = `${displayName}/${year}/${month}/${day}`.replace(/\//g, '-')
  const outputzip = foldername + '.zip'
  if (process.send) {
    process.send(`Zip: ${outputzip}`)
    console.log('Sent output filename! :)')
  } else {
    console.log('Output file name not sent to parent. :(')
  }

  const snapshotZip = zipper.folder(foldername)
  const getRequests = []

  console.log(snapshotPages)
  console.log(snapshotEndpoints)

  for (let pageIndex = 0; pageIndex < snapshotPages.length; pageIndex++) {
    for (let endpointIndex = 0; endpointIndex < snapshotEndpoints.length; endpointIndex++) {
      const key = `${bucketPrefix}${displayName}/${year}/${month}/${day}/${snapshotPages[pageIndex]}/${snapshotEndpoints[endpointIndex]}`
      console.log(`Request: ${key}`)

      const getParams = {
        Bucket: saveBucket,
        Key: key
      }

      const awsPromise = s3.getObject(getParams).promise()
      getRequests.push(awsPromise)
    }
  }

  Promise.all(getRequests).then(responses => {
    let pageIndex = 0
    let endpointIndex = 0

    for (let responseNumber = 0; responseNumber < responses.length; responseNumber++) {
      const filename = `${snapshotPages[pageIndex]}/${snapshotEndpoints[endpointIndex]}`
      process.stdout.write(`Zipping ${filename}... `)

      snapshotZip.file(filename, responses[responseNumber].Body, { binary: true }) // Screenshots and others can both be saved as binary.
      console.log('✓ Done!')

      // Iterates through each endpoint for every path, matching the requests.
      endpointIndex++
      if (endpointIndex >= snapshotEndpoints.length) {
        endpointIndex = 0
        pageIndex++
      }
    }

    snapshotZip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(
        fs.createWriteStream(`${outputzip}`).on('finish', () => {
          console.log(`${outputzip} is ready!`)
          if (process.send) {
            process.send('Done zipping')
          } else {
            console.log("Parent doesn't know how their kid is doing.. :(")
          }
        })
      )
  })
}

module.exports.getScreenshot = async (day, month, year, product, page, breakpoint) => {
  const today = new Date()

  if (!day) day = today.getDate()
  if (!month) month = today.getMonth() + 1
  if (!year) year = today.getFullYear()

  if (!product) product = 'barrons' // Default to Barron's because we're the coolest :)

  // This is nasty but they're all different ugh.
  const displayName = getDisplayName(product)

  const file = `${page}/screenshots/shot${breakpoint}.png`
  console.log(file)
  const filename = `${product}-${page}-${year}-${month}-${day}@${breakpoint}.png`

  console.log(`Writing ${filename}... `)
  if (process.send) {
    process.send(`Screenshot: ${filename}`)
  } else {
    console.log("Parent doesn't know how their kid is doing.. :(")
  }

  const data = await getData(file, day, month, year, displayName)
  console.log(data)

  fs.writeFileSync(filename, data.Body)

  console.log(`${file} is ready!`)
  if (process.send) {
    process.send('Done downloading')
  } else {
    console.log("Parent doesn't know how their kid is doing.. :(")
  }
}

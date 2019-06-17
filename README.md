# snapshot-service

This is an AWS lambda service that takes a snapshot of all the sites that we want for archiving and comparing later. A snapshot includes screenshots of the site, but also a copy of the HTML, CSS, and JS that was used to generate it.

## Automated Snapshot Page List

None *yet*!

## Manual snapshot generation

Details on how to force a snapshot to be generated and how to do it on other pages. 

## Running locally

Clone the repository

Run npm install

* If you're on windows/linux you will have to install additional software to get puppeteer to work correctly. You can also just use docker on your own computer.

Edit /etc/hosts to add in this entry:
```
127.0.0.1   test-bucket.localhost
```

Run npm run local to start a local fake s3 server (with s3rver)

RUn npm start to start the snapshot service, and go to localhost:8080 to trigger the storage!
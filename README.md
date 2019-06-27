# snapshot-service

This is an service that takes a snapshot of all the sites that we want for archiving and comparing later. A snapshot includes screenshots of the site, but also a copy of the HTML, CSS, and JS that was used to generate it so that they can be interactively viewed later too. 

## How to use

The end user just has to go to the servo instance's endpoint for the latest snapshot, or a specific date to download the snapshot for any date after **6/27/2019**.

http://int.production.snapshot-service.oregon.dj01.onservo.com/

OR

http://int.production.snapshot-service.oregon.dj01.onservo.com/date/{{day}}/{{month}}/{{year}}

If any of the day, month, or year is omitted then it will use the current date.

## Automated Snapshot Page List

### Barrons

* Home (/home)
* Market Data Center (/market-data)
* Advisor Center (advisor-center)
* Penta (/penta)

## Manual snapshot generation

Details on how to force a snapshot to be generated and how to do it on other pages incoming once that funcitonality is added. 

## Running locally

Clone the repository

Run `npm install`

* If you're on windows/linux you will have to install additional software to get puppeteer to work correctly. You can also just use docker with the dockerfile used for servo deployments on your own computer.

Edit /etc/hosts to add in this entry:
```
127.0.0.1   test-bucket.localhost
```

Run `npm run server` to start a local fake s3 server (with s3rver - this way we don't waste money poking Amazon)

RUn `npm run local` to start the snapshot service, and go to localhost:8080 to trigger the storage!

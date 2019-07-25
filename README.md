# snapshot-service

This is an service that takes a snapshot of all the sites that we want for archiving and comparing later. A snapshot includes screenshots of the site, but also a copy of the HTML, CSS, and JS that was used to generate it so that they can be interactively viewed later too. 

## Running locally

Clone the repository

Run `npm install`

* If you're on windows/linux you will have to install additional software to get puppeteer to work correctly. You can also just use docker with the dockerfile used for servo deployments on your own computer.

Edit /etc/hosts to add in this entry:
```
127.0.0.1   test-bucket.localhost
```

Run `npm run server` to start a local fake s3 server (with s3rver - this way we don't waste money poking Amazon)

RUn `npm run local` to start the snapshot service, and **go to localhost:8080 to view the site**! 

**Going to localhost:8080/snap will trigger a new snapshot** to be taken on your computer. 

## CLI

The end user just has to go to the servo instance's endpoint for the latest snapshot, or a specific date to download the snapshot for any date after and including **7/8/2019**. If any of the day, month, or year is omitted then it will use the current date.

EX: http://int.production.snapshot-service.oregon.dj01.onservo.com/date/{{day}}/{{month}}/{{year}}

Other Dow Jones sites (WSJ, FNLondon) can also be selected by appending /Barrons, /WSJ, or /FNLondon to the url. However, non-barrons products do not have snapshots before **7/17/2019**.

## Automated Snapshot Page List - from data/paths

* *homepage is a special path, snapshots will just go to the domain, no addition path after that.*

### Barrons

* Home (/homepage)
* Market Data Center (/market-data)
* Advisor Center (advisor-center)
* Penta (/penta)

### WSJ

* Homepage (/homepage)
* Politics (/news/politics)
* Magazine (/news/magazine)
* Video (/video)

### FNLondon

* Homepage (/homepage)
* News (/news)
* People (/people_)

## Adding Pages

Just add an entry in paths.json. If you're adding a product, make sure it's whatever is between the www. and the .com. So, www.barrons.com just has barrons in the array name for it inside paths.json. 

To display that product name with better capitalization, edit display-names.js. Please don't add spaces or slashes in there though, that will break the app!


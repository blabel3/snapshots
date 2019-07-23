// Internal dependencies
const paths = require('../data/paths')
// External dependencies
const axios = require('axios')

const goToSites = async () => {  
    const sites = Object.entries(paths)
    const requests = []
  
    for (let domainIndex = 0; domainIndex < sites.length; domainIndex++) {
      const domain = `https://www.${sites[domainIndex][0]}.com`
      const pages = sites[domainIndex][1]
  
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        let linkCheck = axios.head(`${domain}/${pages[pageIndex]}`)
            .catch( error => { console.log(`${domain}/${pages[pageIndex]} broke... ` + error)})
        requests.push(linkCheck)
        }
    }
  
    // Go to all the sites
    Promise.all(requests).catch( error => { console.log.log(error); return false })

    return true
}

module.exports.goToSites = goToSites

const getDisplayName = product => {
  switch (product) {
    case 'barrons':
      return 'Barrons'
    case 'wsj':
      return 'WSJ'
    case 'fnlondon':
      return 'FNLondon'
    case 'marketwatch':
      return 'MarketWatch'
    case 'mansionglobal':
      return 'MansionGlobal'
    default:
      console.log('No display name set, assuming you want it the same.')
  }
  return product
}

module.exports.getDisplayName = getDisplayName

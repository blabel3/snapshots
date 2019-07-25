const getDisplayName = product => {
  switch (product) {
    case 'barrons':
      return 'Barrons'
    case 'wsj':
      return 'WSJ'
    case 'fnlondon':
      return 'FNLondon'
    default:
      console.log('No display name set, assuming you want it the same.')
  }
  return product
}

module.exports.getDisplayName = getDisplayName

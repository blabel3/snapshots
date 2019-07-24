import $ from 'jquery'
import 'air-datepicker-en'
import './../node_modules/air-datepicker-en/dist/css/datepicker.min.css'
import paths from './../data/paths.json'

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

const getDate = () => {
  const dirtyDate = $('#archive').val()
  const date = dirtyDate.split(' ').map(numberString => parseInt(numberString)) // Ensures we have actual date numbers. No zeroes throwing stuff off either.
  return date
}

const downloadZip = () => {
  const date = getDate()
  const product = $(" input[name='product']:checked").val()
  console.log(product)
  console.log(`Going to /date/${date[0]}/${date[1]}/${date[2]}/${product}...`)
  window.history.pushState(null, 'Snapshots')
  window.location.replace(`/date/${date[0]}/${date[1]}/${date[2]}/${product}`)
}

const downloadScreenshot = () => {
  const date = getDate()
  const webpage = $('#pages').val()
  const breakpoint = $('#breakpoints').val()
  const product = $("input[name='product']:checked").val()
  console.log(`${webpage} ${breakpoint} ${product}`)
  window.history.pushState(null, 'Snapshots')
  window.location.replace(`/page/${product}/${breakpoint}/${date[0]}/${date[1]}/${date[2]}/${webpage}`)
}

const updateDropDown = function updateDropDown () {
  $('#pages').empty()
  for (const path of paths[`${this.value}`]) {
    const option = document.createElement('option')
    option.text = path.replace('/', ' ').replace('-', ' ').split(' ').map(string => { return string.charAt(0).toUpperCase() + string.substring(1) }).join('-')
    option.value = path
    $('#pages').append(option, null)
  }
}

// Make these functions available to the html
window.downloadZip = downloadZip
window.downloadScreenshot = downloadScreenshot
// window.updateDropDown = updateDropDown

$(document).ready(() => {
  console.log(paths)

  // Create product buttons from paths
  for (const productName of Object.keys(paths)) {
    const label = document.createElement('label')
    label.classList.add('product')
    label.id = `${productName}-label`
    label.for = `prod-${productName}`

    const input = document.createElement('input')
    input.type = 'radio'
    input.id = `prod-${productName}`
    input.name = 'product'
    input.value = productName

    label.appendChild(input)
    label.appendChild(document.createTextNode(getDisplayName(productName)))

    console.log(label)
    $('#products').append(label, null)
  }
  $('input:radio[name=product]:first').attr('checked', true)

  $("input[type=radio][name='product'").change(updateDropDown)

  const datepicker = $('#archive').datepicker({
    language: 'en',
    inline: true,
    minDate: new Date(2019, 7 - 1, 8), // year, month (adjusted for 0-11 instead of 1-12), and day from first snap.
    maxDate: new Date(),
    dateFormat: 'd m yyyy',
    onRenderCell: (date, cellType) => {
      if (cellType === 'day') {
        return (date.getDay() === 0 || date.getDay() === 6) ? { disabled: true } : { disabled: false }
      }
    },
    onSelect: (formattedDate, date, inst) => {
      console.log(formattedDate)
      // Changing the page screenshot dropdowns here would require getting AWS access in this js frontend. Very difficult
    }
  }).data('datepicker')

  datepicker.selectDate(new Date())

  const products = $('input[name=product]')
  console.log(products)
  for (let i = 0; i < products.length; i++) {
    products[i].onchange = function () {
      const label = $('label')
      const color = window.getComputedStyle(label[0]).getPropertyValue('border-top-color')
      $('body').css('background-color', color)
      $('.download').css('background-color', color)
    }
  }
})

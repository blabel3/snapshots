import $ from 'jquery'
import 'air-datepicker-en'
import './../node_modules/air-datepicker-en/dist/css/datepicker.min.css'
import paths from './../data/paths.json'

const downloadDate = () => {
  const dirtyDate = $('#archive').val()
  const date = dirtyDate.split(' ').map(numberString => parseInt(numberString)) // Ensures we have actual date numbers. No zeroes throwing stuff off either.
  const product = $(" input[name='product']:checked").val()
  console.log(product)
  console.log(`Going to /date/${date[0]}/${date[1]}/${date[2]}/${product}...`)
  window.history.pushState(null, 'Snapshots')
  window.location.replace(`/date/${date[0]}/${date[1]}/${date[2]}/${product}`)
}

const downloadScreenshot = () => {
  const page = $('#pages').val()
  console.log(page)
}

const updateDropDown = function updateDropDown() {
  $('#pages').empty()
  for (let path of paths[`${this.value}`]) {
    let option = document.createElement('option')
    option.text = path.replace('/', ' ').replace('-', ' ').split(' ').map(string => { return string.charAt(0).toUpperCase() + string.substring(1) }).join('-')
    option.value = path
    $('#pages').append(option, null)
  }
}

// Make these functions available to the html
window.downloadDate = downloadDate
window.downloadScreenshot = downloadScreenshot
//window.updateDropDown = updateDropDown

$(document).ready(() => {
  console.log(paths)

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
      const label = $(`label[for="${products[i].id}"`)
      const color = window.getComputedStyle(label[0]).getPropertyValue('border-top-color')
      $('body').css('background-color', color)
      $('.download').css('background-color', color)
    }
  }
})

import $ from 'jquery'
import 'air-datepicker-en'
import './../node_modules/air-datepicker-en/dist/css/datepicker.min.css'

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

// Make these functions available to the html
window.downloadDate = downloadDate
window.downloadScreenshot = downloadScreenshot

$(document).ready(() => {
  // $('#downloadSnapshot').attr('onClick', downloadDate())
  // $('#downloadScreenshot').attr('onClick', downloadScreenshot())

  const datepicker = $('#archive').datepicker({
    language: 'en',
    inline: true,
    minDate: new Date(2019, 7 - 1, 8), // year, month (adjusted for 0-11 instead of 1-12), and day from first snap.
    maxDate: new Date(),
    dateFormat: 'd m yyyy',
    onRenderCell: function (date, cellType) {
      if (cellType === 'day') {
        return (date.getDay() === 0 || date.getDay() === 6) ? { disabled: true } : { disabled: false }
      }
    },
    onSelect: function updateDropdown (formattedDate, date, inst) {
      console.log(formattedDate)
      /* onst dateArray = formattedDate.split(' ').map(numberString => parseInt(numberString))
        $("#pages").empty();
            $("#breakpoints").empty();
            $.get(`pages/${dateArray[0]}/${dateArray[1]}/${dateArray[2]}`, (data) => {
                console.log(data);
            }); */
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

let datepicker = $('#archive').datepicker({
    language: "en",
    inline: true,
    minDate: new Date(2019, 7 + 1, 8),
    maxDate: new Date(),
    dateFormat: "d m yyyy",
    onRenderCell: function (date, cellType) {
        if (cellType == 'day') {
            return (date.getDay() == 0 || date.getDay() == 6) ? {disabled: true} : { disabled: false }
        }
    }
}).data('datepicker');

datepicker.selectDate(new Date());

function downloadDate() {
    let dirtyDate = document.getElementById("archive").value;
    console.log(dirtyDate);
    let date = dirtyDate.split(" ").map( numberString => parseInt(numberString)); //ensures we have actual date numbers. 
    console.log(date);
    console.log(`/date/${date[0]}/${date[1]}/${date[2]}`);
    window.location.replace(`/date/${date[0]}/${date[1]}/${date[2]}`);
}

function downloadScreenshot() {
    let page = document.getElementById("pages").value;
    console.log(page);
}
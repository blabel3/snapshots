$('#archive').datepicker({
    language: "en",
    inline: true,
    minDate: new Date(2019, 6, 1),
    maxDate: new Date(),
    startDate: new Date(),
    dateFormat: "d m yyyy",
    onRenderCell: function (date, cellType) {
        if (cellType == 'day') {
            return (date.getDay() == 0 || date.getDay() == 6) ? {disabled: true} : { disabled: false }
        }
    }
});

function downloadDate() {
    var date = document.getElementById("archive").value;
    console.log(date);
    let dateParsed = date.split(" ").map( numberString => parseInt(numberString)); //ensures we have actual date numbers. 
    console.log(dateParsed);
    console.log(`/date/${dateParsed[0]}/${dateParsed[1]}/${dateParsed[2]}`);
    window.location.replace(`/date/${dateParsed[0]}/${dateParsed[1]}/${dateParsed[2]}`);
}
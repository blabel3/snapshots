$(document).ready( () => {
    let datepicker = $('#archive').datepicker({
        language: "en",
        inline: true,
        minDate: new Date(2019, 7 - 1, 8), //year, month (adjusted for 0-11 instead of 1-12), and day from first snap.
        maxDate: new Date(),
        dateFormat: "d m yyyy",
        onRenderCell: function (date, cellType) {
            if (cellType == 'day') {
                return (date.getDay() == 0 || date.getDay() == 6) ? {disabled: true} : { disabled: false }
            }
        },
        onSelect: function updateDropdown(formattedDate, date, inst){
            console.log(formattedDate);
            let dateArray = formattedDate.split(" ").map( numberString => parseInt(numberString));
            /*$("#pages").empty();
            $("#breakpoints").empty();
            $.get(`pages/${dateArray[0]}/${dateArray[1]}/${dateArray[2]}`, (data) => {
                console.log(data);
            });*/
        }
    }).data('datepicker');

    datepicker.selectDate(new Date()); 

    let products = $('input[name=product]');
    console.log(products);
    for (let i = 0; i < products.length; i++){
        products[i].onchange = function () {
            let label = $(`label[for="${products[i].id}"`);
            let color = window.getComputedStyle(label[0]).getPropertyValue('border-top-color');
            $("body").css("background-color", color);
            $(".download").css("background-color", color);
            $("select").css("border-color", color);
        }
    }
});

function downloadDate() {
    let dirtyDate = document.getElementById("archive").value;
    let date = dirtyDate.split(" ").map( numberString => parseInt(numberString)); //ensures we have actual date numbers. No zeroes throwing stuff off either. 
    let product = $(" input[name='product']:checked").val();
    console.log(product);
    console.log(`Going to /date/${date[0]}/${date[1]}/${date[2]}/${product}...`);
    window.location.replace(`/date/${date[0]}/${date[1]}/${date[2]}/${product}`);
}

function downloadScreenshot() {
    let page = document.getElementById("pages").value;
    console.log(page);

}



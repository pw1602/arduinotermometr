const CHARTTABLES = {
    day: [['Godzina', 'Temperatura'], [0, 0]],
    avgWeek: [['Dzień tygodnia', 'Dzień (06:00 - 19:00)', 'Noc (20:00 - 5:00)'], [0, 0, 0]],
    avgMonth: [['Dzień miesiąca', 'Dzień (06:00 - 19:00)', 'Noc (20:00 - 5:00)'], [0, 0, 0]],
};
let dataFromDB = null;
let selectedDate = 0;
let selectedTemp = 'C';
let selectedMonth = 0;

$(window).on('resize', function() {
    chart();
});

$(function() {
    $.datepicker.regional["pl"];

    const date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    selectedDate = yy + '-' + mm + '-' + dd;
    selectedMonth = mm - 1;
    changeAllWebsiteDates(selectedDate);

    $.ajax({
        type: "post",
        url: "./php/get.php",
        data: {
            selectedDate: selectedDate,
            type: 'dates'
        },
        dataType: "json"
    })
    .done(function(res) {
        $('#datePicker').datepicker("option", "minDate", res[0][0].dataPomiaru);
        $('#datePicker').datepicker("option", "maxDate", res[1][0].dataPomiaru);
    });

    $.ajax({
        type: "post",
        url: "./php/get.php",
        data: {
            selectedDate: selectedDate,
            type: 'data'
        },
        dataType: "json"
    })
    .done(function(res) {
        dataFromDB = res;

        prepareTable(CHARTTABLES.day, res[0]);
        prepareTable(CHARTTABLES.avgWeek, res[1], res[2], 'AVG', true);
        prepareTable(CHARTTABLES.avgMonth, res[3], res[4], 'AVG');
        chart();
        insertIntoHTMLTable(res[0]);
    });
});

$('#datePicker').datepicker({
    dateFormat: "yy-mm-dd",
    changeMonth: true,
    changeYear: true,
    showOtherMonths: true,
    selectOtherMonths: true,
    showButtonPanel: true,
    onSelect: function(dateText) {
        if (this.value != selectedDate) {
            selectedDate = this.value;
            
            let tmp = $(this).datepicker('getDate');
            selectedMonth = tmp.getMonth();
            
            return $(this).change();
        } //if
    } //onSelect
})
.on("change", function() {
    changeAllWebsiteDates(selectedDate);

    $.ajax({
        url: "./php/get.php",
        type: "post",
        dataType: 'json',
        data: {
            selectedDate: selectedDate,
            type: 'data'
        }
    })
    .done(function(res) {
        dataFromDB = res;

        prepareTable(CHARTTABLES.day, res[0]);
        prepareTable(CHARTTABLES.avgWeek, res[1], res[2], 'AVG', true);
        prepareTable(CHARTTABLES.avgMonth, res[3], res[4], 'AVG');
        chart();
        insertIntoHTMLTable(res[0]);
    });
});

function changeAllWebsiteDates(date) {
    $('#choosedDate').text(date);
}

google.charts.load('current', {'packages':['corechart', 'line']});
google.charts.setOnLoadCallback(chart);

function chart() {
    const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
    
    const dayData = new google.visualization.arrayToDataTable(CHARTTABLES.day);
    const avgWeekData = new google.visualization.arrayToDataTable(CHARTTABLES.avgWeek);
    const avgMonthData = new google.visualization.arrayToDataTable(CHARTTABLES.avgMonth);
    
    const dayChart = new google.visualization.LineChart(document.getElementById('dayChart'));
    const avgWeekChart = new google.visualization.LineChart(document.getElementById('avgWeekChart'));
    const avgMonthChart = new google.visualization.LineChart(document.getElementById('avgMonthChart'));

    const dayOptions = {
        title: 'Godzinowa temperatura (' + selectedDate + ')',
        legend: { position: 'top' },
        hAxis: {title: 'Godzina'},
        vAxis: {title: 'Temperatura (°' + selectedTemp + ')'},
        colors: ['#dd8f00']
    };
    
    const weekOptions = {   
        title: 'Średnia temperatura przypadająca na dany dzień tygodnia (' + MONTHS[selectedMonth] + ')',
        legend: { position: 'top' },
        hAxis: {title: 'Dzień Tygodnia'},
        vAxis: {title: 'Temperatura (°' + selectedTemp + ')'},
        colors: ['#cc0000', '#0052cc']
    };
    
    const monthOptions = {
        title: 'Średnia temperatura przypadająca na dany dzień miesiąca (' + MONTHS[selectedMonth] + ')',
        legend: { position: 'top' },
        hAxis: {title: 'Dzień Miesiąca', format: '0'},
        vAxis: {title: 'Temperatura (°' + selectedTemp + ')'},
        colors: ['#cc0000', '#0052cc']
    };

    dayChart.draw(dayData, dayOptions);
    avgWeekChart.draw(avgWeekData, weekOptions);
    avgMonthChart.draw(avgMonthData, monthOptions);
}

function insertIntoHTMLTable(data) {
    $('#tableBody').empty();
    for (let i = 0; i < data.length; i++) {
        $('#tableBody').append('<tr><th scope="row">' + data[i].godzinaPomiaru + '</th><td>' + data[i].tempC + '</td><td>' + data[i].tempF + '</td><td>' + data[i].tempK + '</td></tr>');
    }
}

function prepareTable(table, data, data2 = null, type = 'D', avgW = false) {
    if (type != 'D' && data.lenght === 0 & data2.length === 0) {
        return;
    } else if (data.length === 0) {
        return;
    }

    table.length = 1;

    const DAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

    for (let i = 0; i < data.length; i++) {
        let tmp = selectedTemp == 'F' ? data[i].tempF : selectedTemp == 'K' ? data[i].tempK : data[i].tempC;

        if (type == 'AVG') {
            let tmp2 = selectedTemp == 'F' ? data2[i].tempF : selectedTemp == 'K' ? data2[i].tempK : data2[i].tempC;
            let tmp3 = avgW ? DAYS[data[i].dzien - 1] : parseInt(data[i].dzien);
            table.push([tmp3, parseInt(tmp), parseInt(tmp2)]);
        } else {
            table.push([data[i].godzina, parseInt(tmp)]);
        }
    }
}

$('#btnCelcius').click(function (e) { 
    e.preventDefault();
    selectedTemp = 'C';
    prepareTable(CHARTTABLES.day, dataFromDB[0]);
    prepareTable(CHARTTABLES.avgWeek, dataFromDB[1], dataFromDB[2], 'AVG', true);
    prepareTable(CHARTTABLES.avgMonth, dataFromDB[3], dataFromDB[4], 'AVG');
    chart();
});

$('#btnFahrenheit').click(function (e) { 
    e.preventDefault();
    selectedTemp = 'F';
    prepareTable(CHARTTABLES.day, dataFromDB[0]);
    prepareTable(CHARTTABLES.avgWeek, dataFromDB[1], dataFromDB[2], 'AVG', true);
    prepareTable(CHARTTABLES.avgMonth, dataFromDB[3], dataFromDB[4], 'AVG');
    chart();
});

$('#btnKelvin').click(function (e) { 
    e.preventDefault();
    selectedTemp = 'K';
    prepareTable(CHARTTABLES.day, dataFromDB[0]);
    prepareTable(CHARTTABLES.avgWeek, dataFromDB[1], dataFromDB[2], 'AVG', true);
    prepareTable(CHARTTABLES.avgMonth, dataFromDB[3], dataFromDB[4], 'AVG');
    chart();
});
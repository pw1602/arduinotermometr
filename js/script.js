'use strict';

const DAYS = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

let dataFromDB = null;
let selectedDate = 0;
let selectedTemp = 'C';
let selectedMonth = 0;
let selectedWeek = 0;

const btnTable = $('#btnTable');
const datePicker = $('#datePicker');

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
    selectedWeek = getWeek(new Date(selectedDate));
    changeAllWebsiteDates(selectedDate);
    
    btnTable.text('Schowaj tabelę');

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
        datePicker.datepicker("option", "minDate", res[0][0].dataPomiaru);
        datePicker.datepicker("option", "maxDate", res[1][0].dataPomiaru);
    });

    $.ajax({
        type: "post",
        url: "./php/get.php",
        data: {
            selectedDate: selectedDate,
            selectedWeek: selectedWeek,
            type: 'data'
        },
        dataType: "json"
    })
    .done(function(res) {
        dataFromDB = res;

        chart();
        insertIntoHTMLTable(res[0]);
    });
});

datePicker.datepicker({
    dateFormat: "yy-mm-dd",
    changeMonth: true,
    changeYear: true,
    showOtherMonths: true,
    selectOtherMonths: true,
    showButtonPanel: true,
    showWeek: true,
    firstDay: 0,
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
    selectedWeek = getWeek(new Date(selectedDate));

    $.ajax({
        url: "./php/get.php",
        type: "post",
        dataType: 'json',
        data: {
            selectedDate: selectedDate,
            selectedWeek: selectedWeek,
            type: 'data'
        }
    })
    .done(function(res) {
        dataFromDB = res;

        chart();
        insertIntoHTMLTable(res[0]);
    });
});

$(window).on('resize', function() {
    chart();
});

$('#btnCelcius').click(function(e) { 
    e.preventDefault();
    selectedTemp = 'C';
    chart();
});

$('#btnFahrenheit').click(function(e) { 
    e.preventDefault();
    selectedTemp = 'F';
    chart();
});

$('#btnKelvin').click(function(e) { 
    e.preventDefault();
    selectedTemp = 'K';
    chart();
});

btnTable.click(function(e) {
    e.preventDefault();
    const text = btnTable.text();

    $('.left').toggle();

    if (text == 'Schowaj tabelę') {
        btnTable.text('Pokaż tabelę');
        $('.right').css('width', '100%');
        chart();
    } else {
        btnTable.text('Schowaj tabelę');
        $('.right').css('width', '70%');
        chart();
    }
});

function changeAllWebsiteDates(date) {
    $('#choosedDate').text(date);
}

function getWeek(fromDate){
    const sunday = new Date(fromDate.setDate(fromDate.getDate() - fromDate.getDay()));
    const result = [sunday.getFullYear() + '-' + (sunday.getMonth() + 1) + '-' + sunday.getDate()];

    while (sunday.setDate(sunday.getDate() + 1) && sunday.getDay() !== 0) {
        result.push(sunday.getFullYear() + '-' + (sunday.getMonth() + 1) + '-' + sunday.getDate());
    }

    return result;
}

google.charts.load('current', {'packages':['corechart', 'line']});
google.charts.setOnLoadCallback(chart);

function chart() {
    const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
    
    const dayData = new google.visualization.arrayToDataTable(getDayAndWeekTable(dataFromDB[0], 'D'));
    const weekData = new google.visualization.arrayToDataTable(getDayAndWeekTable(dataFromDB[1], 'W'));
    const avgWeekData = new google.visualization.arrayToDataTable(getAvgTable(dataFromDB[2], dataFromDB[3], 'W'));
    const avgMonthData = new google.visualization.arrayToDataTable(getAvgTable(dataFromDB[4], dataFromDB[5], 'M'));
    
    const dayChart = new google.visualization.LineChart(document.getElementById('dayChart'));
    const weekChart = new google.visualization.LineChart(document.getElementById('weekChart'));
    const avgWeekChart = new google.visualization.LineChart(document.getElementById('avgWeekChart'));
    const avgMonthChart = new google.visualization.LineChart(document.getElementById('avgMonthChart'));

    const dayOptions = {
        title: 'Godzinowa temperatura (' + selectedDate + ')',
        legend: { position: 'top' },
        hAxis: {title: 'Godzina'},
        colors: ['#dd8f00']
    };

    const weekOptions = {
        title: `Średnia tygodniowa temperatura (${selectedWeek[0]} - ${selectedWeek[6]})`,
        legend: { position: 'top' },
        colors: ['#dd8f00']
    };
    
    const avgWeekOptions = {   
        title: 'Średnia temperatura przypadająca na dany dzień tygodnia (' + MONTHS[selectedMonth] + ')',
        legend: { position: 'top' },
        colors: ['#cc0000', '#0052cc']
    };
    
    const avgMonthOptions = {
        title: 'Średnia temperatura przypadająca na dany dzień miesiąca (' + MONTHS[selectedMonth] + ')',
        legend: { position: 'top' },
        hAxis: {title: 'Dzień Miesiąca', format: '0'},
        colors: ['#cc0000', '#0052cc']
    };

    dayChart.draw(dayData, dayOptions);
    weekChart.draw(weekData, weekOptions);
    avgWeekChart.draw(avgWeekData, avgWeekOptions);
    avgMonthChart.draw(avgMonthData, avgMonthOptions);
}

function insertIntoHTMLTable(data) {
    if (!Array.isArray(data)) {
        console.error('[insertIntoHTMLTable] Dane muszą być tablicą!');
        return;
    }

    $('#tableBody').empty();
    for (let i = 0; i < data.length; i++) {
        $('#tableBody').append('<tr><th scope="row">' + data[i].godzinaPomiaru + '</th><td>' + data[i].tempC + '</td><td>' + data[i].tempF + '</td><td>' + data[i].tempK + '</td></tr>');
    }
}

function getAvgTable(data, data2, type) {
    if (type != 'W' && type != 'M') {
        console.error(`[getAvgTable] Podany typ jest niezgodny z danymi! (${type})`);
        return;
    }

    const avgWeek = [['Dzień tygodnia', 'Dzień (06:00 - 19:00)', 'Noc (20:00 - 5:00)']];
    const avgMonth = [['Dzień miesiąca', 'Dzień (06:00 - 19:00)', 'Noc (20:00 - 5:00)']];

    for (let i = 0; i < data.length; i++) {
        let temp = selectedTemp == 'F' ? data[i].tempF : selectedTemp == 'K' ? data[i].tempK : data[i].tempC;
        let temp2 = selectedTemp == 'F' ? data2[i].tempF : selectedTemp == 'K' ? data2[i].tempK : data2[i].tempC;

        if (type == 'W') {
            const day = DAYS[data[i].dzien - 1];
            avgWeek.push([day, parseInt(temp), parseInt(temp2)]);
        } else {
            avgMonth.push([parseInt(data[i].dzien), parseInt(temp), parseInt(temp2)]);
        }
    }

    if (avgMonth.length == 1) {
        avgMonth.push([0, 0, 0]);
    }

    if (avgWeek.length == 1) {
        avgWeek.push([0, 0, 0]);
    }

    if (type == 'W') {
        return avgWeek;
    } else {
        return avgMonth;
    }
}

function getDayAndWeekTable(data, type) {
    if (!Array.isArray(data)) {
        console.error('[getDayTable] Dane muszą być tablicą!');
        return;
    }

    if (type != 'D' && type != 'W') {
        console.error(`[getDayTable] Podany typ jest niezgodny z danymi! (${type})`);
        return;
    }

    const table = type == 'D' ? [['Godzina', 'Temperatura']] : [['Dzień', 'Temperatura']];

    if (data.length === 0) {
        table.push([0, 0]);
    } else {
        for (let i = 0; i < data.length; i++) {
            const temp = selectedTemp === 'F' ? data[i].tempF : selectedTemp === 'K' ? data[i].tempK : data[i].tempC;

            if (type == 'D') {
                table.push([data[i].godzina, parseInt(temp)]);
            } else {
                const day = DAYS[data[i].dzien - 1];
                table.push([day, parseInt(temp)]);
            }
        }
    }

    return table;
}
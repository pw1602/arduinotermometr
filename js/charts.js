const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

function drawCalendar() {
    if ($("#chartTab a.active").attr("id") != "yearTab") return;

    const calendarData = new google.visualization.arrayToDataTable(getCalendar(dataFromDB[6]));
    const calendarChart = new google.visualization.Calendar(document.getElementById("calendarChart"));

    const calendarOptions = {
        title: "Średnia temperatura w danym dniu (°" + selectedTemp + ")",
        calendar: {
            daysOfWeek: "NPWŚCPS",
            cellSize: 17,
        },
        colorAxis: {
            colors: ["#02a2ff", "#ff2402"]
        },
        height: 175
    };

    calendarChart.draw(calendarData, calendarOptions);
}

function drawMonthChart() {
    if ($("#chartTab a.active").attr("id") != "monthTab") return;

    const avgWeekData = new google.visualization.arrayToDataTable(getAvgTable(dataFromDB[2], dataFromDB[3], "W"));
    const avgMonthData = new google.visualization.arrayToDataTable(getAvgTable(dataFromDB[4], dataFromDB[5], "M"));

    const avgWeekChart = new google.visualization.LineChart(document.getElementById("avgWeekChart"));
    const avgMonthChart = new google.visualization.LineChart(document.getElementById("avgMonthChart"));

    const avgWeekOptions = {   
        title: "Średnia temperatura przypadająca na dany dzień tygodnia (" + MONTHS[selectedMonth - 1] + " " + selectedYear + ")",
        legend: { position: "top" },
        colors: ["#cc0000", "#0052cc"],
        vAxis: {title: "°" + selectedTemp}
    };
    
    const avgMonthOptions = {
        title: "Średnia temperatura przypadająca na dany dzień miesiąca (" + MONTHS[selectedMonth - 1] + " " + selectedYear +  ")",
        legend: { position: "top" },
        hAxis: {title: "Dzień Miesiąca", format: "0"},
        colors: ["#cc0000", "#0052cc"],
        vAxis: {title: "°" + selectedTemp}
    };

    avgWeekChart.draw(avgWeekData, avgWeekOptions);
    avgMonthChart.draw(avgMonthData, avgMonthOptions);
}

function drawWeekChart() {
    if ($("#chartTab a.active").attr("id") != "weekTab") return;

    const weekData = new google.visualization.arrayToDataTable(getDayAndWeekTable(dataFromDB[1], "W"));
    const weekChart = new google.visualization.LineChart(document.getElementById("weekChart"));

    const weekOptions = {
        title: "Średnia tygodniowa temperatura (" + selectedWeek[0] + " - " + selectedWeek[1] + ")",
        legend: { position: "top" },
        colors: ["#dd8f00"],
        vAxis: {title: "°" + selectedTemp}
    };

    weekChart.draw(weekData, weekOptions);
}

function drawDayChart() {
    if ($("#chartTab a.active").attr("id") != "dayTab") return;

    const dayData = new google.visualization.arrayToDataTable(getDayAndWeekTable(dataFromDB[0], "D"));
    const dayChart = new google.visualization.LineChart(document.getElementById("dayChart"));

    const dayOptions = {
        title: "Godzinowa temperatura (" + selectedDate + ")",
        legend: { position: "top" },
        //hAxis: {title: "Godzina"},
        colors: ["#dd8f00"],
        vAxis: {title: "°" + selectedTemp}
    };
    
    dayChart.draw(dayData, dayOptions);
}
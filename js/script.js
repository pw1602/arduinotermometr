"use strict";

let dataFromDB = [];
let selectedDate = 0;
let selectedTemp = "C";
let selectedMonth = 0;
let selectedWeek = 0;
let selectedYear = 0;
let monthDates = [];

const btnTable = $("#btnTable");
const datePicker = $("#datePicker");
const weekPicker = $("#weekPicker");

$(function() {
    $.datepicker.regional["pl"];

    const date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();

    if (dd < 10) {
        dd = "0" + dd;
    }

    if (mm < 10) {
        mm = "0" + mm;
    }

    selectedDate = yy + "-" + mm + "-" + dd;
    selectedMonth = mm;
    selectedWeek = getWeekRange(new Date(selectedDate));
    selectedYear = yy;
    changeAllWebsiteDates(selectedDate);
    
    btnTable.text("Schowaj tabelę");

    $.ajax({
        type: "post",
        url: "./php/get.php",
        data: {
            selectedDate: selectedDate,
            type: "dates"
        },
        dataType: "json"
    })
    .done(function(res) {
        const firstDay = res[0][0].dataPomiaru;
        const lastDay = res[1][0].dataPomiaru;
        datePicker.datepicker("option", {minDate: firstDay, maxDate: lastDay});
        weekPicker.datepicker("option", {minDate: firstDay, maxDate: lastDay});

        monthDates = res[2];

        const firstYear = new Date(firstDay).getFullYear();
        const lastYear = new Date(lastDay).getFullYear();

        for (let i = firstYear; i <= lastYear; i++) {
            const option = `<option value="` + i + `">` + i + `</option>`;
            $(option).appendTo("#yearPicker");
            $(option).appendTo("#monthChartYearPicker");
        }

        for (let i = 0; i < res[2].length; i++) {
            const data = res[2][i];
            if (data.year == $("#monthChartYearPicker").val()) {
                const month = `<option value="` + data.month + `">` + MONTHS[data.month - 1] + `</option>`;
                $(month).appendTo("#monthChartMonthPicker");
            }
        }
    });

    $.ajax({
        type: "post",
        url: "./php/get.php",
        data: {
            selectedDate: selectedDate,
            selectedWeek: selectedWeek,
            selectedYear: yy,
            type: "all"
        },
        dataType: "json"
    })
    .done(function(res) {
        dataFromDB = res;
        google.charts.load("current", {"packages":["corechart", "line", "calendar"], callback: drawChart, "language": "pl"});
        insertIntoHTMLTable(res[0]);
    });
});

weekPicker.datepicker({
    dateFormat: "yy-mm-dd",
    changeMonth: true,
    changeYear: true,
    showOtherMonths: true,
    selectOtherMonths: true,
    showButtonPanel: true,
    showWeek: true,
    firstDay: 0,
    onSelect: function(dateText, inst) {
        const week = getWeekRange(new Date(dateText));
        $(this).val(week[0] + " do " + week[1]);

        $.ajax({
            type: "post",
            url: "./php/get.php",
            data: {
                selectedWeek: week,
                type: "week"
            },
            dataType: "json"
        })
        .done(function(res) {
            dataFromDB[1] = res[0];
            selectedWeek = week;
            drawChart();
        });
    }
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
    onSelect: function(dateText, inst) {
        if (this.value != selectedDate) {
            selectedDate = this.value;
            
            return $(this).change();
        } //if
    } //onSelect
})
.on("change", function() {
    changeAllWebsiteDates(selectedDate);

    $.ajax({
        url: "./php/get.php",
        type: "post",
        dataType: "json",
        data: {
            selectedDate: selectedDate,
            type: "day"
        }
    })
    .done(function(res) {
        dataFromDB[0] = res[0];

        drawChart();
        insertIntoHTMLTable(res[0]);
    });
});

$(window).on("resize", function() {
    drawChart();
});

$("#btnCelcius").click(function(e) { 
    e.preventDefault();
    selectedTemp = "C";
    drawChart();
});

$("#btnFahrenheit").click(function(e) { 
    e.preventDefault();
    selectedTemp = "F";
    drawChart();
});

$("#btnKelvin").click(function(e) { 
    e.preventDefault();
    selectedTemp = "K";
    drawChart();
});

btnTable.click(function(e) {
    e.preventDefault();
    const text = btnTable.text();

    $(".left").toggle();

    if (text == "Schowaj tabelę") {
        btnTable.text("Pokaż tabelę");
        $(".right").css("width", "98%");
        drawChart();
    } else {
        btnTable.text("Schowaj tabelę");
        $(".right").css("width", "70%");
        drawChart();
    }
});

$("#chartTab > li > a").click(function(e) {
    e.preventDefault();

    const id = $(this).attr("id");
    draw(id);

    if (id != 'weekTab') {
        $(".ui-weekpicker").off("mousemove");
        $(".ui-weekpicker").off("mouseleave");
        weekPicker.datepicker('widget').removeClass('ui-weekpicker');
    } else {
        weekPicker.datepicker('widget').addClass('ui-weekpicker');
        $(".ui-weekpicker").on("mousemove", "tr", function() {
            $(this).find("td a").addClass("ui-state-hover");
        });
        
        $(".ui-weekpicker").on("mouseleave", "tr", function() {
            $(this).find("td a").removeClass("ui-state-hover");
        });
    }
    
});

$("#yearPicker").change(function(e) {
    e.preventDefault();

    $.ajax({
        url: "./php/get.php",
        type: "post",
        dataType: "json",
        data: {
            selectedYear: $(this).val(),
            type: "year"
        }
    })
    .done(function(res) {
        dataFromDB[6] = res[0];
        drawChart();
    });
});

$("#monthChartYearPicker").change(function(e) {
    e.preventDefault();

    const monthPicker = $("#monthChartMonthPicker");
    monthPicker.empty();

    for (let i = 0; i < monthDates.length; i++) {
        const data = monthDates[i];
        if (data.year == $(this).val()) {
            const option = `<option value="` + data.month + `">` + MONTHS[data.month - 1] + `</option>`
            $(option).appendTo(monthPicker);
        }
    }
});

$("#monthPicker").submit(function(e) {
    e.preventDefault();

    const year = $("#monthChartYearPicker").val();
    const month = $("#monthChartMonthPicker").val();

    if (year == selectedYear && month == selectedMonth) {
        return;
    }

    $.ajax({
        url: "./php/get.php",
        type: "post",
        dataType: "json",
        data: {
            selectedDate: month < 10 ? year + "-0" + month + "-01" : year + "-" + month + "-01",
            type: "month"
        }
    })
    .done(function(res) {
        selectedMonth = month;
        selectedYear = year;
        dataFromDB[2] = res[0];
        dataFromDB[3] = res[1];
        dataFromDB[4] = res[2];
        dataFromDB[5] = res[3];
        drawChart();
    });
});

function draw(id) {
    switch(id) {
        default: break;
        
        case "yearTab": {
            setTimeout(drawCalendar, 50);
            break;
        }

        case "monthTab": {
            setTimeout(drawMonthChart, 50);
            break;
        }

        case "weekTab": {
            setTimeout(drawWeekChart, 50);
            break;
        }

        case "dayTab": {
            setTimeout(drawDayChart, 50);
            break;
        }
    }
}

function drawChart() {
    const active = $("#chartTab a.active").attr("id");
    draw(active);
}
const DAYS = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

function insertIntoHTMLTable(data) {
    if (!Array.isArray(data)) {
        console.error("[insertIntoHTMLTable] Dane muszą być tablicą!");
        return;
    }

    $("#tableBody").empty();

    if (data.length === 0) {
        return $("#tableBody").append('<tr><th scope="row"> 00:00:00</th><td>0</td><td>0</td><td>0</td></tr>');
    }

    for (let i = 0; i < data.length; i++) {
        $("#tableBody").append('<tr><th scope="row">' + data[i].godzinaPomiaru + "</th><td>" + parseFloat(data[i].tempC.toFixed(4)) + "</td><td>" + parseFloat(data[i].tempF.toFixed(4)) + "</td><td>" + parseFloat(data[i].tempK.toFixed(4)) + "</td></tr>");
    }
}

function getAvgTable(data, data2, type) {
    if (type != "W" && type != "M") {
        console.error("[getAvgTable] Podany typ jest niezgodny z danymi! (" + type + ")");
        return;
    }

    const avgWeek = [["Dzień tygodnia", "Dzień (06:00 - 19:00)", "Noc (20:00 - 5:00)"]];
    const avgMonth = [["Dzień miesiąca", "Dzień (06:00 - 19:00)", "Noc (20:00 - 5:00)"]];

    for (let i = 0; i < data.length; i++) {
        let temp = selectedTemp == "F" ? data[i].tempF : selectedTemp == "K" ? data[i].tempK : data[i].tempC;
        let temp2 = selectedTemp == "F" ? data2[i].tempF : selectedTemp == "K" ? data2[i].tempK : data2[i].tempC;

        if (type == "W") {
            const day = DAYS[data[i].dzien - 1];
            avgWeek.push([day, parseFloat(temp.toFixed(4)), parseFloat(temp2.toFixed(4))]);
        } else {
            avgMonth.push([parseInt(data[i].dzien), parseFloat(temp.toFixed(4)), parseFloat(temp2.toFixed(4))]);
        }
    }

    if (avgMonth.length == 1) {
        avgMonth.push([0, 0, 0]);
    }

    if (avgWeek.length == 1) {
        avgWeek.push([0, 0, 0]);
    }

    if (type == "W") {
        return avgWeek;
    } else {
        return avgMonth;
    }
}

function getDayAndWeekTable(data, type) {
    if (!Array.isArray(data)) {
        console.error("[getDayTable] Dane muszą być tablicą!");
        return;
    }

    if (type != "D" && type != "W") {
        console.error("[getDayTable] Podany typ jest niezgodny z danymi! (" + type + ")");
        return;
    }

    const table = type == "D" ? [["Godzina", "Temperatura"]] : [["Dzień", "Temperatura"]];

    if (data.length === 0) {
        table.push([0, 0]);
    } else {
        for (let i = 0; i < data.length; i++) {
            const temp = selectedTemp === "F" ? data[i].tempF : selectedTemp === "K" ? data[i].tempK : data[i].tempC;

            if (type == "D") {
                table.push([data[i].godzina, parseFloat(temp.toFixed(4))]);
            } else {
                const day = DAYS[data[i].dzien - 1];
                table.push([day, parseFloat(temp.toFixed(4))]);
            }
        }
    }

    return table;
}

function getCalendar(data) {
    if (!Array.isArray(data)) {
        console.error("[getCalendar] Dane muszą być tablicą!");
        return;
    }

    const table = [["Dzień", "Średnia temperatura"]];

    if (data.length === 0) {
        table.push([0, 0]);
    } else {
        for (let i = 0; i < data.length; i++) {
            const temp = selectedTemp === "F" ? data[i].tempF : selectedTemp === "K" ? data[i].tempK : data[i].tempC;
            table.push([new Date(data[i].dataPomiaru), parseFloat(temp.toFixed(4))]);
        }
    }

    return table;
}

function changeAllWebsiteDates(date) {
    $("#choosedDate").text(date);
}

function getWeek(fromDate) {
    const sunday = new Date(fromDate.setDate(fromDate.getDate() - fromDate.getDay()));
    const result = [];

    let day = sunday.getDate();
    let month = sunday.getMonth() + 1;
    let year = sunday.getFullYear();

    result.push(year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day));

    while (sunday.setDate(sunday.getDate() + 1) && sunday.getDay() !== 0) {
        day = sunday.getDate();
        month = sunday.getMonth() + 1;
        year = sunday.getFullYear();

        result.push(year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day));
    }

    return result;
}

function getWeekRange(fromDate) {
    const weekTable = getWeek(fromDate);
    return [weekTable[0], weekTable[weekTable.length - 1]];
}
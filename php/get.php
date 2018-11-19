<?php
    include './global.php';

    $year = getYear($_POST["selectedDate"]);
    $month = getMonth($_POST["selectedDate"]);
    $monthLength = date('t', mktime(0, 0, 0, $month, 1, $year));
    $monthDates = array(
        getYear($_POST["selectedDate"]) . '-' . getMonth($_POST["selectedDate"]) . '-01',
        getYear($_POST["selectedDate"]) . '-' . getMonth($_POST["selectedDate"]) . '-' . $monthLength
    );

    try {
        $db = new PDO("mysql:host=$SERVERNAME;dbname=$DATABASE", $USER, $PASSWORD);
        $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $response = array();
        $sql = null;
        $exec = null;

        if ($_POST['type'] == 'dates') {
            $sql = array(
                "SELECT dataPomiaru FROM temperatury ORDER BY dataPomiaru ASC LIMIT 1",
                "SELECT dataPomiaru FROM temperatury ORDER BY dataPomiaru DESC LIMIT 1",
            );
        } else if ($_POST['type'] == 'data') {
            $sql = array(
                "SELECT dataPomiaru, godzinaPomiaru, TIME_FORMAT(godzinaPomiaru, '%H:%i') AS godzina, tempC, tempF, tempK FROM temperatury WHERE dataPomiaru = DATE(:selectedDate) ORDER BY godzinaPomiaru",
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('06:00:00') AND godzinaPomiaru <= TIME('19:00:00')) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('00:00:00') AND godzinaPomiaru <= TIME('05:00:00') OR godzinaPomiaru >= TIME('20:00:00') AND godzinaPomiaru <= TIME('23:00:00')) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFMONTH(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('06:00:00') AND godzinaPomiaru <= TIME('19:00:00')) GROUP BY DAYOFMONTH(dataPomiaru)",
                "SELECT DAYOFMONTH(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('00:00:00') AND godzinaPomiaru <= TIME('05:00:00') OR godzinaPomiaru >= TIME('20:00:00') AND godzinaPomiaru <= TIME('23:00:00')) GROUP BY DAYOFMONTH(dataPomiaru)",
                "SELECT dataPomiaru, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury GROUP BY dataPomiaru"
            );
            $exec = array(
                array('selectedDate' => $_POST['selectedDate']),
                array($_POST['selectedWeek'][0], $_POST['selectedWeek'][6]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                null
            );
        } //if

        for ($i = 0; $i < count($sql); $i++) {
            $request = $db->prepare($sql[$i]);
            
            if (is_array($exec[$i])) {
                $request->execute($exec[$i]);
            } else {
                $request->execute();
            }//if

            $result = $request->fetchAll(PDO::FETCH_ASSOC);
            array_push($response, $result);
        } //for

        echo json_encode($response);
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
    }//try, catch
?>
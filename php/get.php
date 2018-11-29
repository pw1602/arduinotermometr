<?php
    include './global.php';

    try {
        $db = new PDO("mysql:host=$SERVERNAME;dbname=$DATABASE", $USER, $PASSWORD);
        $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $response = array();
        $sql = null;
        $exec = null;

        $TYPE = null;
        $SELECTED_YEAR = null;
        $SELECTED_DATE = null;
        $SELECTED_WEEK = null;

        if (isset($_POST['type'])) $TYPE = $_POST['type'];
        if (isset($_POST['selectedYear'])) $SELECTED_YEAR = $_POST['selectedYear'];
        if (isset($_POST['selectedDate'])) $SELECTED_DATE = $_POST['selectedDate'];
        if (isset($_POST['selectedWeek'])) $SELECTED_WEEK = $_POST['selectedWeek'];
        
        if ($TYPE == 'dates') {
            $sql = array(
                "SELECT dataPomiaru FROM temperatury ORDER BY dataPomiaru ASC LIMIT 1",
                "SELECT dataPomiaru FROM temperatury ORDER BY dataPomiaru DESC LIMIT 1",
                "SELECT MONTH(dataPomiaru) AS month, YEAR(dataPomiaru) AS year FROM temperatury GROUP BY MONTH(dataPomiaru), YEAR(dataPomiaru)"
            );
        } else if ($TYPE == 'year') {
            $sql = array(
                "SELECT dataPomiaru, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE YEAR(dataPomiaru) = ? GROUP BY dataPomiaru"
            );
            $exec = array(
                array($SELECTED_YEAR)
            );
        } else if ($TYPE == 'day') {
            $sql = array(
                "SELECT dataPomiaru, godzinaPomiaru, TIME_FORMAT(godzinaPomiaru, '%H:%i') AS godzina, tempC, tempF, tempK FROM temperatury WHERE dataPomiaru = DATE(?) ORDER BY godzinaPomiaru",
            );

            $exec = array(
                array($SELECTED_DATE),
            );
        } else if ($TYPE == 'week') {
            $sql = array(
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) GROUP BY DAYOFWEEK(dataPomiaru)",
            );

            $exec = array(
                array($SELECTED_WEEK[0], $SELECTED_WEEK[1]),
            );
        } else if ($TYPE == 'month') {
            $sql = array(
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('06:00:00') AND godzinaPomiaru <= TIME('19:00:00')) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('00:00:00') AND godzinaPomiaru <= TIME('05:00:00') OR godzinaPomiaru >= TIME('20:00:00') AND godzinaPomiaru <= TIME('23:00:00')) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFMONTH(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('06:00:00') AND godzinaPomiaru <= TIME('19:00:00')) GROUP BY DAYOFMONTH(dataPomiaru)",
                "SELECT DAYOFMONTH(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('00:00:00') AND godzinaPomiaru <= TIME('05:00:00') OR godzinaPomiaru >= TIME('20:00:00') AND godzinaPomiaru <= TIME('23:00:00')) GROUP BY DAYOFMONTH(dataPomiaru)",
            );

            $year = getYear($SELECTED_DATE);
            $month = getMonth($SELECTED_DATE);
            $monthLength = date('t', mktime(0, 0, 0, $month, 1, $year));
            $monthDates = array(
                $year . '-' . $month . '-01',
                $year . '-' . $month . '-' . $monthLength
            );

            $exec = array(
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
            );
        } else if ($TYPE == 'all') {
            $sql = array(
                "SELECT dataPomiaru, godzinaPomiaru, TIME_FORMAT(godzinaPomiaru, '%H:%i') AS godzina, tempC, tempF, tempK FROM temperatury WHERE dataPomiaru = DATE(?) ORDER BY godzinaPomiaru",
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('06:00:00') AND godzinaPomiaru <= TIME('19:00:00')) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFWEEK(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('00:00:00') AND godzinaPomiaru <= TIME('05:00:00') OR godzinaPomiaru >= TIME('20:00:00') AND godzinaPomiaru <= TIME('23:00:00')) GROUP BY DAYOFWEEK(dataPomiaru)",
                "SELECT DAYOFMONTH(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('06:00:00') AND godzinaPomiaru <= TIME('19:00:00')) GROUP BY DAYOFMONTH(dataPomiaru)",
                "SELECT DAYOFMONTH(dataPomiaru) AS dzien, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE (dataPomiaru >= DATE(?) AND dataPomiaru <= DATE(?)) AND (godzinaPomiaru >= TIME('00:00:00') AND godzinaPomiaru <= TIME('05:00:00') OR godzinaPomiaru >= TIME('20:00:00') AND godzinaPomiaru <= TIME('23:00:00')) GROUP BY DAYOFMONTH(dataPomiaru)",
                "SELECT dataPomiaru, AVG(tempC) AS tempC, AVG(tempF) AS tempF, AVG(tempK) AS tempK FROM temperatury WHERE YEAR(dataPomiaru) = ? GROUP BY dataPomiaru"
            );

            $year = getYear($SELECTED_DATE);
            $month = getMonth($SELECTED_DATE);
            $monthLength = date('t', mktime(0, 0, 0, $month, 1, $year));
            $monthDates = array(
                $year . '-' . $month . '-01',
                $year . '-' . $month . '-' . $monthLength
            );

            $exec = array(
                array($SELECTED_DATE),
                array($SELECTED_WEEK[0], $SELECTED_WEEK[1]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                array($monthDates[0], $monthDates[1]),
                array($SELECTED_YEAR)
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
<?php
    $SERVERNAME = 'localhost';
    $DATABASE = 'id5113340_arduino';
    $USER = 'root';
    $PASSWORD = '';

    function getMonth($selectedDate) {
        $array = str_split($selectedDate);

        return $array[5] . $array[6];
    } //function

    function getYear($selectedDate) {
        $array = str_split($selectedDate);

        return $array[0] . $array[1]. $array[2] . $array[3];
    } //function
?>
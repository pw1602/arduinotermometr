<?php
    /*header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
    echo $_POST['data'];
    exit;*/
    
    date_default_timezone_set('Europe/Warsaw');
    include './global.php';
    
    if (isset($_POST['type']) && isset($_POST['data'])) {
        if ($_POST['type'] == 'single') {
            $tmp = explode(':', $_POST['data']);
            
            try {
                $db = new PDO("mysql:host=$SERVERNAME;dbname=$DATABASE", $USER, $PASSWORD);
                $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
                $request = $db->prepare("INSERT INTO temperatury (dataPomiaru, godzinaPomiaru, tempC, tempF, tempK) VALUES (?, ?, ?, ?, ?)");
                $request->execute(array(
                    date("Ymd", intval($tmp[0])),
                    date("His", intval($tmp[0])),
                    $tmp[1],
                    $tmp[1] * 1.8 + 32,
                    $tmp[1] + 273.15
                ));
            } catch(PDOException $e) {
                $file = fopen("http.log", "a");
                fwrite($file, $e->getMessage() . "\n");
                fclose($file);
                //echo "Connection failed: " . $e->getMessage();
            } //try, catch
        } else if ($_POST['type'] == 'multi') {
            $explode = explode(";", $_POST["data"]);
            
            try {
                $db = new PDO("mysql:host=$SERVERNAME;dbname=$DATABASE", $USER, $PASSWORD);
                $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
                for($i = 0; $i < count($explode) - 1; $i++) {
                    $tmp = explode(':', $explode[$i]);
                    $request = $db->prepare("INSERT INTO temperatury (dataPomiaru, godzinaPomiaru, tempC, tempF, tempK) VALUES (?, ?, ?, ?, ?)");
                    
                    $request->execute(array(
                        date("Ymd", intval($tmp[0])),
                        date("His", intval($tmp[0])),
                        $tmp[1],
                        $tmp[1] * 1.8 + 32,
                        $tmp[1] + 273.15
                    ));
                }
            } catch(PDOException $e) {
                echo $_POST['data'];
                $file = fopen("http.log", "a");
                fwrite($file, $e->getMessage() . "\n");
                fclose($file);
                //echo "Connection failed: " . $e->getMessage();
            } //try, catch
        } //if
    } else {
        $text = "[" . date("Y/m/d") . " " . date("H:i") . "]" . " - Wrong post parameters! [data: " . isset($_POST['data']) . "] [type: " . isset($_POST['type']) . "]\n";
        file_put_contents("http.log", $text, FILE_APPEND | LOCK_EX);
    }//if
?>
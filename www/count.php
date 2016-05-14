<?php
        $startcount = 0;
        if ($_POST['action'] == "increment") {
            $startcount = countInc(); 
        }
        
        function countInc() {
            $count = ("counter.txt");
            $clicks = file($count);
            $clicks[0]++;
            $counter = fopen("counter.txt", "w+") or die("Error opening counter.txt!");
            fwrite($counter, "$clicks[0]");
            return $clicks[0];
        }
 
?>
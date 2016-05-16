<!doctype HTML>
<html>
	<head>
		<meta charset="utf-8">
        <title>Megumin is love</title>
        <link rel="icon" href="favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="css/style.css">
        <link href='https://fonts.googleapis.com/css?family=Courgette' rel='stylesheet' type='text/css'>
        <script src="js/count_proto2.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/js/ion.sound.min.js"></script>
    </head>
    <body>
        <?php $countfile = fopen("counter.txt", "r")?>
        <div id="box">
		  <div id="counter"><?php echo fread($countfile, filesize("counter.txt")); fclose($countfile);?></div>
            <button id="button" onclick="count();">やめろ!!</button>
            <a href="version.html" id="version">[ver. P2]</a>
        </div>
        <audio id="yamero" src="yamero.mp3" preload="auto"></audio>
	</body>
	<footer>
        <p>Created and maintained by robflop<a id="credits" href="credits.html"> -> Credits</a></p>
	</footer>
</html>
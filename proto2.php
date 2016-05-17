<!doctype HTML>
<html>

<head>
    <meta charset="utf-8">
    <!--FACEBOOK-->
    <meta property="og:title" content="Megumin is love">
    <meta property="og:site_name" content="Megumin is love">
    <meta property="og:url" content="http://megumin.love">
    <meta property="og:description" content="Fansite about best girl Megumin from the anime called 'Kono Subarashii Sekai ni Shukufuku wo!'">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_US">
    <!--TWITTER-->
    <meta property="twitter:card" content="summary">
    <meta property="twitter:title" content="Megumin is love">
    <meta property="twitter:description" content="Fansite about best girl Megumin from the anime called 'Kono Subarashii Sekai ni Shukufuku wo!'">
    <meta property="twitter:creator" content="@robflop98">
    <meta property="twitter:url" content="http://megumin.love">
    <meta name="keywords" content="megumin, love, konosuba, best girl, best, girl, anime">
    <meta name="description" content="Fansite about best girl Megumin from the anime called 'Kono Subarashii Sekai ni Shukufuku wo!'">
    <title>Megumin is love</title>
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/style.css">
    <link href='https://fonts.googleapis.com/css?family=Courgette' rel='stylesheet' type='text/css'>
    <script src="js/count_proto2.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/js/ion.sound.min.js"></script>
    <script src="js/share.js"></script>
    <script src="//opensharecount.com/bubble.js"></script>
</head>

<body>
    <?php $countfile = fopen("counter.txt", "r")?>
        <div id="box">
            <div id="counter">
                <?php echo fread($countfile, filesize("counter.txt")); fclose($countfile);?>
            </div>
            <button id="button" onclick="count();">やめろ!!</button>
            <a href="version.html" id="version">[ver. P2]</a>
            <span id="share-buttons">
                <a href="https://twitter.com/share" class="twitter-share-button" data-url="http://megumin.love" data-text="New Megumin fansite! Check it out!" data-via="robflop98">Tweet</a>
                <a href="http://megumin.love" target="_blank" class="osc-counter" data-dir="left">1</a>
                <div class="fb-share-button" data-href="https://megumin.love" data-layout="button_count" data-mobile-iframe="true"></div>
            </span>
        </div>
        <audio id="yamero" src="yamero.mp3" preload="auto"></audio>
</body>
<footer>
    <p>Created and maintained by robflop<a id="credits" href="credits.html"> -> Credits</a></p>
</footer>

</html>
<?php
ob_start();
include('includes/cache_counter.php');
$currentCount = ob_get_clean();
?>
    <!doctype HTML>
    <html lang="en">

    <head>
        <meta charset="utf-8">
        <!--FACEBOOK-->
        <meta property="og:title" content="Megumin is love!">
        <meta property="og:site_name" content="Megumin is love!">
        <meta property="og:url" content="https://megumin.love">
        <meta property="og:description" content="Fansite about best girl Megumin from the anime called 'Kono Subarashii Sekai ni Shukufuku wo!'">
        <meta property="og:type" content="website">
        <meta property="og:locale" content="en_US">
        <meta property="og:image" content="https://megumin.love/images/bg.png">
        <!--TWITTER-->
        <meta property="twitter:card" content="summary">
        <meta property="twitter:title" content="Megumin is love!">
        <meta property="twitter:description" content="Fansite about best girl Megumin from the anime called 'Kono Subarashii Sekai ni Shukufuku wo!'">
        <meta property="twitter:creator" content="@robflop98">
        <meta property="twitter:url" content="https://megumin.love">
        <meta property="twitter:site" content="@robflop98">
        <meta property="twitter:image" content="https://megumin.love/images/bg.png">
        <meta name="keywords" content="megumin, love, konosuba, best girl, best, girl, anime">
        <meta name="description" content="Fansite about best girl Megumin from the anime called 'Kono Subarashii Sekai ni Shukufuku wo!'">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
        <title>Megumin is love!</title>
        <link rel="icon" href="favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="css/style.css">
        <link href='https://fonts.googleapis.com/css?family=Courgette' rel='stylesheet' type='text/css'>
    </head>

    <body>
        <div id="navbar-slide" class="navbarPc">
            <img src="/images/hangumin.png" alt="Megumin Sidebar" />
            <div id="navbar-slide-inner" class="navbarPc">
                <h2 id="megsquad">Megumin Squad assemble!</h2>
                <p>Be sure to also visit the following Sites:</p>
                <p>-><a href="https://robflop.pw">robflop.pw</a>, my personal Site</p>
                <p>-><a href="http://megum.in">megum.in</a> by Kagumi</p>
                <p>-><a href="https://cerx.pw/megumin">cerx.pw/megumin</a> by Cerx</p>
                <p>-><a href="http://megumin.pw">megumin.pw</a> by ricsivg</p>
                <hr>
                <p>Have Suggestions, found a bug or want me
                    <br>to do your taxes? Shoot me a message
                    <a href="https://www.reddit.com/message/compose/?to=robflop&subject=megumin.love">
                        <br>on reddit</a> or under <a href="mailto:robflop@megumin.love">robflop@megumin.love</a>!</p>
                <p>In addition, be sure to check out the 
                <br><a href="https://discord.gg/0u643X7fpwihIjTQ">r/megumin Discord Server</a>! 
                <br>Me and the owners of the other sites are
                <br>around there most of the time, too.</p>
            </div>
        </div>
        <div id="box" style="display:none;">
            <div id="counter">
                <?php echo $currentCount; ?>
            </div>
            <button id="button" onclick="ga('send', 'event', 'Button', 'click');">やめろ!!</button>
            <a href="version.html" id="version">[ver1.1]</a>
            <span id="share-buttons">
            <a href="https://twitter.com/intent/tweet?text=New%20Megumin%20Fansite%21%20Check%20it%20out%21&via=robflop98&url=https%3A%2F%2Fmegumin.love" onclick="window.open(this.href, '', 'width=650, height=450, menubar=no, toolbar=no, scrollbars=yes'); ga('send', 'event', 'Twitter', 'click'); return false; ">
            <img src="/images/twitter.png" alt="Tweet on Twitter" /></a>
            <a href="https://www.facebook.com/sharer.php?u=https://megumin.love" onclick="window.open(this.href, '', 'width=650, height=450, menubar=no, toolbar=no, scrollbars=yes'); ga('send', 'event', 'Facebook', 'click'); return false;">
            <img src="/images/facebook.png" alt="Share on Facebook" /></a>
            <a href="https://www.reddit.com/submit?url=https://megumin.love;title=megumin.love" target="_blank" onclick="ga('send', 'event', 'Reddit', 'click');">
            <img src="/images/reddit.png" alt="Submit to Reddit"></a>
            </span>
        </div>

        <footer>
            <p>Created and maintained by robflop<a id="credits" href="credits.html"> -> Credits</a></p>
        </footer>

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
        <script src="js/count.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/js/ion.sound.min.js"></script>
        <script src="js/googleanalytics.js"></script>
    </body>

    </html>
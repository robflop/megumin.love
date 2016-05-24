<?php
ob_start();
include('includes/update_counter.php');
$currentCount = ob_get_clean();
?>
    <!doctype HTML>
    <html lang="en">


<body>
    <div id="box">
        <div id="counter">
            <?php file_get_contents("includes/update_counter.php");?>
        </div>
        <button id="button">やめろ!!</button>
        <a href="version.html" id="version">[ver. P3]</a>
        <span id="share-buttons">
            <a href="https://twitter.com/intent/tweet?text=New%20Megumin%20Fansite%21%20Check%20it%20out%21&via=robflop98&url=https%3A%2F%2Fmegumin.love" onclick="window.open(this.href, '', 'width=650, height=450, menubar=no, toolbar=no, scrollbars=yes'); return false;">
            <img src="/images/twitter.png" alt="Tweet on Twitter" /></a>
            <a href="https://www.facebook.com/sharer.php?u=https://megumin.love" onclick="window.open(this.href, '', 'width=650, height=450, menubar=no, toolbar=no, scrollbars=yes'); return false;">
            <img src="/images/facebook.png" alt="Share on Facebook" /></a>
            <a href="https://www.reddit.com/submit?url=http://megumin.love;title=megumin.love" target="_blank">
            <img src="https://www.redditstatic.com/spreddit1.gif" alt="Submit to Reddit"></a>
        </span>





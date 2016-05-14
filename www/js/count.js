function count() {
    $.post("count.php", {action: "increment"}, function(callback){});
    document.getElementById('yamero').play();
    document.getElementById('counter').innerHTML = 
}

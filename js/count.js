function count() {

    ion.sound({
        sounds: [
            {
                name: "yamero"
        }
    ],
        path: "./",
        preload: true,
        multiplay: true,

    });

    $.post("count.php", {
        action: "increment"
    }, function (response) {
        ion.sound.play("yamero");
        document.getElementById('counter').innerHTML = response;
    });
}
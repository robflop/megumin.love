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
console.log("No stealing code! ;) -- Check out the Github Repo at https://git.io/vrrEi instead.");
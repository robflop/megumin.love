$(document).ready(function () {
    console.log("No stealing code! ;) -- Check out the Github Repo at https://git.io/vrrEi instead.");
    ion.sound({ // Initialize all sounds with options
        sounds: [
            {name: "yamero"},
            {name: "pull"},
            {name: "explosion"},
            {name: "itai"},
            {name: "name"},
            {name: "eugh1"},
            {name: "eugh2"},
            {name: "eugh3"},
            {name: "eugh4"},
            {name: "n"},
            {name: "sion"},
            {name: "plosion"},
			{name: "magic-item"},
			{name: "parents"},
			{name: "hyoizaburo"},
			{name: "oi"},
			{name: "igiari"},
			{name: "hmph"}
        ],
        path: "sounds/",
        preload: true,
        multiplay: true,
    });
    $('#button').click(function () { // Randomize sound that is played on buttonclick
        var sounds = ["eugh1", "eugh2", "eugh3", "eugh4", "explosion", "itai", "n", "name", "plosion", "pull", "sion", "yamero", "magic-item", "parents", "hyoizaburo", "oi", "igiari", "hmph"]; 
		var sound = sounds[Math.floor(Math.random()*sounds.length)];
		ion.sound.play(sound);
		// Increase counter client-side
        $('#counter').html(parseInt($('#counter').html()) + 1);
        $.get('/includes/cache_counter.php?count=1').done(function (res) {});
        //// Send GET-request to increase counter server-side
    });
});
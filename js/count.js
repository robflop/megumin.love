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
            {name: "star"},
			{name: "oi"},
			{name: "igiari"},
			{name: "hmph"},
            {name: "zuryah"},
            {name: "whatsthis"},
            {name: "who"},
            {name: "yes"},
            {name: "yoroshii"},
            {name: "tropes"},
            {name: "truepower"},
            {name: "waah"},
            {name: "wellthanks"},
            {name: "oh"},
            {name: "shouganai"},
            {name: "sigh"},
            {name: "splat"},
            {name: "itscold"},
            {name: "ladiesfirst"},
            {name: "mywin"},
            {name: "nani"},
            {name: "dontwanna"},
            {name: "doushimashou"},
            {name: "friends"},
            {name: "hau"},
            {name: "isee"},
            {name: "bighug"},
            {name: "chomusuke"},
            {name: "comeatme"},
            {name: "dododo"},
            {name: "are"},
            {name: "aughh"},
            {name: "chomusukefaint"},
            {name: "ripchomusuke"},
            {name: "explosion2"},
            {name: "losion"},
            {name: "sion2"},
            {name: "n2"},
            {name: "hua"},
            {name: "thinking"}
        ],
        path: "sounds/",
        preload: true,
        multiplay: true,
    });
    $('#button').keypress(function(key) {
    // Listen to keypresses on the button
        if(key.which == 13) { // Checks for the enter key
            key.preventDefault(); // Stops IE from triggering the button if the key used is enter
        };
    });
    $('#button').click(function () { // Randomize sound that is played on buttonclick
        var sounds = ["eugh1", "eugh2", "eugh3", "eugh4", "explosion", "itai", "n", "name", "plosion", "pull", "sion", "yamero", "magic-item", "parents", "hyoizaburo", "star", "oi", "igiari", "hmph", "zuryah", "whatsthis", "who", "yes", "yoroshii", "tropes", "truepower", "waah", "wellthanks", "oh", "shouganai", "sigh", "splat", "itscold", "ladiesfirst", "mywin", "nani", "dontwanna", "doushimashou", "friends", "hau", "isee", "bighug", "chomusuke", "comeatme", "dododo", "are", "aughh", "chomusukefaint", "ripchomusuke", "explosion2", "losion", "sion2", "n2", "hua", "thinking"]; 
		var sound = sounds[Math.floor(Math.random()*sounds.length)];
		ion.sound.play(sound);
		// Increase counter client-side
        $('#counter').html(parseInt($('#counter').html()) + 1);
        $.get('/includes/cache_counter.php?count=1').done(function (res) {});
        //// Send GET-request to increase counter server-side
    });
});
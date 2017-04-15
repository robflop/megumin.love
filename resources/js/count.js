$(document).ready(function() {
	console.log("No stealing code! ;) -- Check out the Github Repo at https://git.io/vrrEi instead.");
	howlerList = {};
	sounds.indexOf('realname')>-1?sounds.splice(sounds.indexOf('realname'),1):"";
	for (var i = sounds.length - 1; i >= 0; i--) {
		howlerList[sounds[i]] = new Howl({src: ["/sounds/"+sounds[i]+".mp3", "/sounds/"+sounds[i]+".ogg", "/sounds/"+sounds[i]+".aac"]});
		// load all sounds
	};
	$('#button').keypress(function(key) {
		if(key.which == 13) {
			key.preventDefault(); // don't trigger the button on "enter" keypress
		};
	});
	$('#button').click(function() { // Randomize sound that is played on buttonclick
		var sound = sounds[Math.floor(Math.random()*sounds.length)];
		howlerList[sound].play();
		$('#counter').html(parseInt($('#counter').html()) + 1);
		// Increase counter client-side
		// $.get("https://megumin.love/increment").done(function(res) {});
		$.get("/increment").done(function(res) {});
        // Send GET-request to increase counter server-side
	});
});
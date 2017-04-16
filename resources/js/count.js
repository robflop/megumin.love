$(document).ready(function() {
	$.get("/counter").done((res) => $('#counter').html(res));
	// load initial counter

	const socket = io.connect('localhost:5959');
	socket.on('update', function(data) {
		$('#counter').html(data.counter);
	});

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

	$('#button').click(function() {
		var sound = sounds[Math.floor(Math.random()*sounds.length)];
		howlerList[sound].play();
		socket.emit('click', {count: 1});
	});
});
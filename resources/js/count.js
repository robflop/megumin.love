$(document).ready(function() {
	const formatNumber = (number) => {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
	};

	$.get("/counter").done((res) => $('#counter').html(formatNumber(res)));
	// load initial counter

	const domainOrIP = document.URL.split('/')[2].split(':')[0];
	let host = 'http://'+domainOrIP;
	let socket;

	$.get("/conInfo").done((res) => {
		const port = res[0], SSLproxy = res[1];
		host = SSLproxy ? host.replace("http", "https") : host += `:${port}`;

		socket = io.connect(host);
		socket.on('update', function(data) {
			$('#counter').html(formatNumber(data.counter));
		});
	});

	howlerList = {};
	sounds.indexOf('realname')>-1?sounds.splice(sounds.indexOf('realname'),1):"";
	for (let i = sounds.length - 1; i >= 0; i--) {
		howlerList[sounds[i]] = new Howl({src: ["/sounds/"+sounds[i]+".mp3", "/sounds/"+sounds[i]+".ogg", "/sounds/"+sounds[i]+".aac"]});
		// load all sounds
	};

	$('#button').keypress(function(key) {
		if(key.which == 13) {
			key.preventDefault(); // don't trigger the button on "enter" keypress
		};
	});

	$('#button').click(function() {
		const sound = sounds[Math.floor(Math.random()*sounds.length)];
		howlerList[sound].play();
		socket.emit('click', {count: 1});
	});
});
$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

	const domainOrIP = document.URL.split('/')[2].split(':')[0];
	const howlerList = {};
	let host = `http://${domainOrIP}`;
	let socket;

	$.get('/conInfo').done(con => {
		const port = con.port, SSLproxy = con.ssl;
		host = SSLproxy ? host.replace('http', 'https') : host += `:${port}`;

		socket = io.connect(host);
		socket.on('update', data => $('#counter').html(formatNumber(data.counter)));
	});

	$.get('/counter').done(res => $('#counter').html(formatNumber(res)));
	// load initial counter

	for (const sound of sounds) {
		if (sound.filename === 'realname') continue;

		howlerList[sound.filename] = new Howl({
			src: [`/sounds/${sound.filename}.mp3`, `/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.aac`]
		});
		// load all sounds
	}

	$('#button').keypress(key => {
		if (key.which === 13) return key.preventDefault();
		// don't trigger the button on 'enter' keypress
	});

	$('#button').click(() => {
		const sound = sounds[Math.floor(Math.random() * sounds.length)];
		socket.emit('click', { count: 1 });
		return howlerList[sound.filename].play();
	});
});
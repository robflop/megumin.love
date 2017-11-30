$(document).ready(() => {
	// background

	const backgroundCookie = (document.cookie.split(';').find(cookie => cookie.trim().startsWith('background')) || '').trim();
	const background = backgroundCookie.substr(backgroundCookie.indexOf('=') + 1);

	if (background === 'rotate' || !background) {
		// falsy check for if no selection has been made, and thus is on standard
		$('body').css('background-image', `url(/images/${['bg1.jpg', 'bg2.jpg', 'bg3.jpg'][Math.round(Math.random() * 2)]})`);
	}
	else {
		$('body').css('background-image', `url(/images/${background}.jpg)`);
	}

	$('#bg-select').val(background || 'rotate');

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'rotate') $('body').css('background-image', `url(/images/${this.value}.jpg)`);
		return document.cookie = `background=${this.value}`;
		/* eslint-enable no-invalid-this */
	});

	// actual functionality

	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let socket;

	$.get('/conInfo').done(con => {
		const domainOrIP = document.URL.split('/')[2].split(':')[0];
		const host = con.ssl ? `https://${domainOrIP}` : `http://${domainOrIP}:${con.port}`;

		socket = io.connect(host);
		socket.on('update', data => data.counter ? $('#counter').html(formatNumber(data.counter)) : null);
	});

	$.get('/counter').done(res => $('#counter').html(formatNumber(res)));
	// load initial counter

	const howlerList = {};

	for (const sound of sounds) {
		if (sound.filename === 'realname') continue;

		howlerList[sound.filename] = new Howl({
			src: [`/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.mp3`],

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
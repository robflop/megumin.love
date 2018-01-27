$(document).ready(() => {
	// background

	const backgroundCookie = (document.cookie.split(';').find(cookie => cookie.trim().startsWith('background')) || '').trim();
	const background = backgroundCookie.substr(backgroundCookie.indexOf('=') + 1);
	const randomBg = ['bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg5.jpg', 'bg6.jpg'][Math.round(Math.random() * 5)];

	if (background === 'rotate' || !background) {
		// falsy check for if no selection has been made, and thus is on standard
		$('body').css('background-image', `url(/images/backgrounds/${randomBg})`);
	}
	else {
		$('body').css('background-image', `url(/images/backgrounds/${background}.jpg)`);
	}

	$('#bg-select').val(background || 'rotate');

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'rotate') $('body').css('background-image', `url(/images/backgrounds/${this.value}.jpg)`);
		return document.cookie = `background=${this.value}`;
		/* eslint-enable no-invalid-this */
	});

	// actual functionality

	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let sounds = [];
	let howlerList = {};

	function loadSounds(s) {
		s.splice(s.findIndex(sound => sound.filename === 'realname'), 1);
		howlerList = {}; // wipe before (re)load
		sounds = s; // reassign new sounds array

		for (const sound of sounds) {
			if (sound.filename === 'realname') continue;

			howlerList[sound.filename] = new Howl({
				src: [`/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.mp3`]
			});
		}
	}

	$.get('/sounds').done(s => {
		s.splice(s.findIndex(sound => sound.filename === 'realname'), 1);
		sounds = s;

		$.get('/conInfo').done(con => {
			const domainOrIP = document.URL.split('/')[2].split(':')[0];
			const host = con.ssl ? `wss://${domainOrIP}` : `ws://${domainOrIP}:${con.port}`;

			const ws = new WebSocket(host);

			ws.addEventListener('open', event => {
				ws.addEventListener('message', message => {
					let data;

					try {
						data = JSON.parse(message.data);
					}
					catch (e) {
						data = {};
					}

					if (!['counterUpdate', 'soundUpdate'].includes(data.type)) return;

					if (data.type === 'soundUpdate' && data.values.sounds) return loadSounds(data.values.sounds);
					else if (data.type === 'counterUpdate' && data.values.counter) return $('#counter').html(formatNumber(data.values.counter));
				});

				$('#button').click(() => {
					const sound = sounds[Math.floor(Math.random() * sounds.length)];
					ws.send(JSON.stringify({ type: 'click' }));

					return howlerList[sound.filename].play();
				});
			});
		});

		$.get('/counter').done(res => $('#counter').html(formatNumber(res)));
		// load initial counter

		loadSounds(sounds);
		// load initial sounds

		$('#button').keypress(key => {
			if (key.which === 13) return key.preventDefault();
			// don't trigger the button on 'enter' keypress
		});
	});
});
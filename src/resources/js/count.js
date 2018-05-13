$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let sounds = [];
	let howlerList = {};

	function toggleButton() {
		if ($('#button').text() === 'No sounds available.') {
			$('#button').text('やめろ!!');
			$('#button').css({
				'font-size': '65px',
				'background-color': '#dd0000',
				'color': '#ff8080' // eslint-disable-line quote-props
			});
			$('#button').prop('disabled', false);
		}
		else {
			$('#button').css({
				'font-size': '40px',
				'background-color': 'rgba(96,96,96,1)',
				'color': 'rgba(56,56,56,1)' // eslint-disable-line quote-props
			});
			$('#button').text('No sounds available.');
			$('#button').prop('disabled', true);
		}
	}

	function loadSounds(s) {
		if (s.find(sound => sound.filename === 'realname')) s.splice(s.findIndex(sound => sound.filename === 'realname'), 1);
		howlerList = {}; // wipe before (re)load
		sounds = s; // reassign new sounds array

		if (sounds.length > 0 && $('#button').text() === 'No sounds available.') toggleButton();
		if (sounds.length === 0 && $('#button').text() === 'やめろ!!') toggleButton();

		for (const sound of sounds) {
			if (sound.filename === 'realname') continue;

			howlerList[sound.filename] = new Howl({
				src: [`/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.mp3`]
			});
		}
	}

	$.get('/sounds').done(s => {
		if (s.find(sound => sound.filename === 'realname')) s.splice(s.findIndex(sound => sound.filename === 'realname'), 1);
		sounds = s;

		if (sounds.length === 0) toggleButton();

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

					if (data.type === 'soundUpdate' && data.sounds) return loadSounds(data.sounds);
					else if (data.type === 'counterUpdate' && data.counter) return $('#counter').html(formatNumber(data.counter));
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
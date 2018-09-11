$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let sounds = [];
	let howlerList = {};

	let crazyMode = document.cookie.split(';').find(cookie => cookie.trim().startsWith('crazyMode')) ? true : false;
	$('#crazymode-toggle').change(function() {
		/* eslint-disable no-invalid-this */
		if (!this.checked) document.cookie = 'crazyMode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
		else document.cookie = 'crazyMode=true';

		return crazyMode = this.checked;
		/* eslint-enable no-invalid-this */
	});

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
		howlerList = {}; // Wipe before (re)load
		sounds = s; // Reassign new sounds array

		if (sounds.length > 0 && $('#button').text() === 'No sounds available.') toggleButton();
		if (sounds.length === 0 && $('#button').text() === 'やめろ!!') toggleButton();

		for (const sound of sounds) {
			howlerList[sound.filename] = new Howl({
				src: [`/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.mp3`]
			});
		}
	}

	$.get('/api/sounds').done(s => {
		sounds = s;

		if (sounds.length === 0) toggleButton();

		$.get('/api/conInfo').done(con => {
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

					if (!['counterUpdate', 'soundUpdate', 'crazyMode', 'notification'].includes(data.type)) return;

					if (data.type === 'soundUpdate' && data.sounds) loadSounds(data.sounds);
					if (data.type === 'counterUpdate' && data.counter) $('#counter').html(formatNumber(data.counter));
					if (data.type === 'crazyMode' && crazyMode) howlerList[data.sound].play();
					if (data.type === 'notification' && data.notification) {
						$('#notification').text(data.notification.text);
						$('#notification-wrapper').fadeIn().fadeOut(data.notification.duration * 1000);
					}
				});

				$('#button').click(() => {
					const sound = sounds[Math.floor(Math.random() * sounds.length)];
					if (sound.filename === 'realname') sound.filename = 'name';
					ws.send(JSON.stringify({ type: 'click', sound: sound.filename }));

					return howlerList[sound.filename].play();
				});
			});
		});

		$.get('/api/counter').done(res => $('#counter').html(formatNumber(res.counter)));
		// Load initial counter

		loadSounds(sounds);
		// Load initial sounds

		$('#button').keypress(key => {
			if (key.which === 13) return key.preventDefault();
			// Don't trigger the button on 'enter' keypress
		});
	});
});
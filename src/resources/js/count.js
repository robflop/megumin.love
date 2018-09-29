document.addEventListener('DOMContentLoaded', () => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let sounds = [];
	let howlerList = {};

	function toggleButton() {
		const button = document.getElementById('button');

		if (button.innerText === 'No sounds available.') {
			button.innerText = 'やめろ!!';
			button.style.fontSize = '65px';
			button.style.backgroundColor = '#dd0000';
			button.style.color = 'ff8080';
			button.disabled = false;
		}
		else {
			button.style.fontSize = '40px';
			button.style.backgroundColor = 'rgba(96,96,96,1)';
			button.style.color = 'rgba(56,56,56,1)';
			button.innerText === 'No sounds available.';
			button.disabled = true;
		}
	}

	function loadSounds(s) {
		const button = document.getElementById('button');
		howlerList = {}; // Wipe before (re)load

		if (sounds.length > 0 && button.innerText === 'No sounds available.') toggleButton();
		if (sounds.length === 0 && button.innerText === 'やめろ!!') toggleButton();

		for (const sound of sounds) {
			howlerList[sound.filename] = new Howl({
				src: [`/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.mp3`]
			});
		}
	}

	fetch('/api/counter').then(res => res.json()).then(res => document.getElementById('counter').innerText = formatNumber(res.counter));

	fetch('/api/sounds').then(res => res.json()).then(s => {
		sounds = s;
		loadSounds(sounds);
	}).then(() => {
		fetch('/api/conInfo').then(res => res.json()).then(con => {
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

					if (data.type === 'soundUpdate' && data.sounds) {
						data.sounds.changedSounds.map(changedSound => sounds[sounds.findIndex(snd => snd.id === changedSound.id)] = changedSound);
						data.sounds.deletedSounds.map(deletedSound => sounds.splice(sounds.findIndex(snd => snd.id === deletedSound.id), 1));
						data.sounds.addedSounds.map(addedSound => sounds.push(addedSound));
						// Compare IDs because all other fields may have changed, id the only constant

						return loadSounds(sounds); // Reload with now-modified sounds array
					}
					else if (data.type === 'counterUpdate' && data.counter) {
						return document.getElementById('counter').innerText = formatNumber(data.counter);
					}
					else if (data.type === 'crazyMode' && localStorage.getItem('crazyMode')) {
						return howlerList[data.soundFilename].play();
					}
					else if (data.type === 'notification' && data.notification) {
						document.getElementById('notification').innerText = data.notification.text;
						return util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
					}
				});

				document.getElementById('button').addEventListener('click', e => {
					const sound = sounds[Math.floor(Math.random() * sounds.length)];
					if (sound.filename === 'realname') sound.filename = 'name';
					ws.send(JSON.stringify({ type: 'click', soundFilename: sound.filename }));

					return howlerList[sound.filename].play();
				});
			});
		});
	});

	document.getElementById('button').addEventListener('keypress', e => {
		if (e.key === 'Enter') return e.preventDefault();
	});
});
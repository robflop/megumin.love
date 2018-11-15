document.addEventListener('DOMContentLoaded', () => {
	let sounds = [];
	let ws;

	/*
		Due to problems with Chrome/Edge/Others browser cache for the
		Howler instances, they need to be created and destroyed immediately
		on play, otherwise if constructed at load and played back from list
		the respective browser audio will crash and not function until restart
	*/

	function loadSoundboard(s) {
		s = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons

		const container = document.getElementById('container');

		if (s.length === 0) {
			const warning = document.createElement('h1');
			warning.id = 'warning';
			warning.innerText = 'No sounds available.';

			document.getElementById('loading').remove();
			return document.getElementById('soundboard').appendChild(warning);
		}

		const soundboard = document.getElementById('soundboard');
		soundboard.innerHTML = ''; // Reset to re-populate

		// Create buttons and make them play corresponding sounds
		for (const sound of s) {
			const sourceName = sound.source.replace(/\s/g, '-').toLowerCase();
			let buttonsWrapper = document.getElementById(`${sourceName}-buttons`);
			// Source as in "Season 1", "Season 1 OVA", etc

			if (sound.filename === 'realname') continue;
			// Don't create button for this one

			if (buttonsWrapper) {
				const soundButton = document.createElement('button');
				soundButton.id = sound.filename;
				soundButton.innerText = sound.displayname;

				buttonsWrapper.appendChild(soundButton);
			}
			else {
				const sourceWrapper = document.createElement('div');
				sourceWrapper.classList.add('source-wrapper');

				soundboard.appendChild(sourceWrapper);

				const sourceTitle = document.createElement('h1');
				sourceTitle.classList.add('titles');
				sourceTitle.innerText = `${sound.source}:`;

				sourceWrapper.appendChild(sourceTitle);

				const playAll = document.createElement('button');
				playAll.classList.add('playall');
				playAll.id = `pa-${sourceName}`;
				playAll.innerText = 'Play all';

				sourceWrapper.appendChild(playAll);

				buttonsWrapper = document.createElement('div'); // Redefined from above check
				buttonsWrapper.classList.add('buttons-wrapper');
				buttonsWrapper.id = `${sourceName}-buttons`;

				sourceWrapper.appendChild(buttonsWrapper);

				if (!document.getElementById(`${sound.filename}`)) {
					const soundButton = document.createElement('button');
					soundButton.id = sound.filename;
					soundButton.innerText = sound.displayname;

					buttonsWrapper.appendChild(soundButton);
				}

				document.getElementById(`pa-${sourceName}`).addEventListener('click', e => {
					sounds.filter(snd => snd.source === sound.source).forEach(snd => {
						const playallHowl = new Howl({
							src: `/sounds/${snd.filename}.mp3`
						});

						playallHowl.on('end', () => playallHowl.unload());
						playallHowl.play();

						// See comment at top for info regarding this way of playing sounds

						return ws.send(JSON.stringify({ type: 'sbClick', soundFilename: snd.filename }));
					});
				});
			}

			if (sound.filename === 'name') {
				document.getElementById('name').addEventListener('click', e => {
					const rsound = Math.floor(Math.random() * 100) + 1;

					if (rsound === 42) {
						const realnameHowl = new Howl({
							src: '/sounds/realname.mp3'
						});
						realnameHowl.on('end', () => realnameHowl.unload());
						realnameHowl.play();

						// See comment at top for info regarding this way of playing sounds

						ws.send(JSON.stringify({ type: 'sbClick', soundFilename: sound.filename }));
					}
					else {
						const nameHowl = new Howl({
							src: '/sounds/name.mp3'
						});
						nameHowl.on('end', () => nameHowl.unload());
						nameHowl.play();

						// See comment at top for info regarding this way of playing sounds

						ws.send(JSON.stringify({ type: 'sbClick', soundFilename: sound.filename }));
					}
				});

				continue;
				// Create button but don't use standard click function
			}

			document.getElementById(sound.filename).addEventListener('click', e => {
				const soundButtonHowl = new Howl({
					src: `/sounds/${sound.filename}.mp3`
				});
				soundButtonHowl.on('end', () => soundButtonHowl.unload());
				soundButtonHowl.play();

				// See comment at top for info regarding this way of playing sounds

				return ws.send(JSON.stringify({ type: 'sbClick', soundFilename: sound.filename }));
			});

			document.getElementById(sound.filename).addEventListener('keypress', e => {
				if (e.key === 'Enter') return e.preventDefault();
				// Don't trigger the button on 'enter' keypress
			});
		}

		if (document.getElementById('loading')) document.getElementById('loading').remove();
	}

	fetch('/api/sounds').then(res => res.json()).then(s => {
		sounds = s;
		loadSoundboard(sounds);
	}).then(() => {
		fetch('/api/conInfo').then(res => res.json()).then(con => {
			const domainOrIP = document.URL.split('/')[2].split(':')[0];
			const host = con.ssl ? `wss://${domainOrIP}` : `ws://${domainOrIP}:${con.port}`;

			ws = new WebSocket(host);

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
						data.sounds.changedSounds.map(changedSound => sounds[sounds.findIndex(snd => snd.id === changedSound.id)] = changedSound); // eslint-disable-line max-nested-callbacks, max-len
						data.sounds.deletedSounds.map(deletedSound => sounds.splice(sounds.findIndex(snd => snd.id === deletedSound.id), 1)); // eslint-disable-line max-nested-callbacks, max-len
						data.sounds.addedSounds.map(addedSound => sounds.push(addedSound));
						// Compare IDs because all other fields may have changed, id the only constant

						return loadSoundboard(sounds); // Reload with now-modified sounds array
					}
					else if (data.type === 'crazyMode' && localStorage.getItem('crazyMode')) {
						const crazyModeHowl = new Howl({
							src: `/sounds/${data.soundFilename}.mp3`
						});
						crazyModeHowl.on('end', () => crazyModeHowl.unload());
						return crazyModeHowl.play();
						// See comment at top for info regarding this way of playing sounds
					}
					else if (data.type === 'notification' && data.notification) {
						document.getElementById('notification').innerText = data.notification.text;
						return util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
					}
				});
			});
		});
	});
});
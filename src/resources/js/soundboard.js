document.addEventListener('DOMContentLoaded', () => {
	let sounds = [];
	let ws;
	let howlerList = {};

	function loadSoundboard(s) {
		s = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons
		howlerList = {}; // Wipe before reload

		if (!s.length) {
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

			howlerList[sound.filename] = new Howl({
				src: `/sounds/${sound.filename}.mp3`
			}); // Register the Howl instances

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
						howlerList[snd.filename].play();

						return ws.send(JSON.stringify({ type: 'sbClick', soundFilename: snd.filename }));
					});
				});
			}

			if (sound.filename === 'name') {
				document.getElementById('name').addEventListener('click', e => {
					const rsound = Math.floor(Math.random() * 100) + 1;

					if (rsound === 42) {
						howlerList.realname.play();

						ws.send(JSON.stringify({ type: 'sbClick', soundFilename: sound.filename }));
					}
					else {
						howlerList.name.play();

						ws.send(JSON.stringify({ type: 'sbClick', soundFilename: sound.filename }));
					}
				});

				continue;
				// Create button but don't use standard click function
			}

			document.getElementById(sound.filename).addEventListener('click', e => {
				howlerList[sound.filename].play();

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

					switch (data.type) {
						case 'crazyMode':
							if (localStorage.getItem('crazyMode')) howlerList[data.soundFilename].play();
							break;
						case 'notification':
							if (data.notification) document.getElementById('notification').innerText = data.notification.text;
							util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
							break;
						case 'soundRename':
							sounds[sounds.findIndex(snd => snd.id === data.sound.id)] = data.sound;
							loadSoundboard(sounds);
							break;
						case 'soundUpload':
							sounds.push(data.sound);
							loadSoundboard(sounds);
							break;
						case 'soundDelete':
							sounds.splice(sounds.findIndex(snd => snd.id === data.sound.id), 1);
							loadSoundboard(sounds);
							break;
						default:
							break;
					}
				});
			});
		});
	});
});
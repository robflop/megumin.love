document.addEventListener('DOMContentLoaded', async () => {
	let activatedSounds = [];
	let howlerList = {};

	function loadSoundboard(sounds, bg = null) {
		sounds.forEach(s => {
			if (!s.displayname) s.displayname = '';
		});

		const bgTheme = themes.find(g => g.backgrounds.some(gBg => gBg.filename === bg));
		if (bgTheme) sounds = sounds.filter(s => s.theme === bgTheme.name);
		else sounds = sounds.filter(s => s.theme === 'megumin');
		// If the bg is associated with a special theme, sort sounds by said theme
		// Otherwise only load default sounds (megumin-related)

		activatedSounds = sounds
			.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons

		howlerList = {};

		const soundboard = document.getElementById('soundboard');
		soundboard.innerHTML = ''; // Reset to re-populate

		if (!activatedSounds.length) {
			const warning = document.createElement('h1');
			warning.id = 'warning';
			warning.innerText = 'No sounds available.';

			if (document.getElementById('loading')) document.getElementById('loading').remove();
			return document.getElementById('soundboard').appendChild(warning);
		}

		// Create buttons and make them play corresponding sounds
		for (const sound of activatedSounds) {
			const sourceName = sound.source.replace(/\s/g, '-').toLowerCase();

			howlerList[sound.filename] = new Howl({
				src: `/sounds/${sound.theme}/${sourceName}/${sound.filename}.mp3`
			});

			if (sound.displayname === '' || sound.source === 'no-source') continue;
			// Don't make button for those without displayname or source

			if (document.getElementById(`${sound.source.replace(/\s/g, '-').toLowerCase()}-buttons`)) {
				// Check if buttons wrapper for source exists and if not create it
				const soundButton = document.createElement('button');
				soundButton.id = sound.filename;
				soundButton.innerText = sound.displayname;

				document.getElementById(`${sound.source.replace(/\s/g, '-').toLowerCase()}-buttons`).appendChild(soundButton);
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

				const buttonsWrapper = document.createElement('div');
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
					activatedSounds.filter(snd => snd.source === sound.source).forEach(snd => {
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

				continue; // Create button but don't use standard click function
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

	const allSounds = await fetch('/api/sounds').then(res => res.json());
	let currentBackground = localStorage.getItem('background') || '';
	let specialBg = themes.map(theme => theme.name).some(thm => currentBackground.startsWith(`${thm}_`)) ? currentBackground : null;
	loadSoundboard(allSounds, specialBg);

	const conInfo = await fetch('/api/conInfo').then(res => res.json());

	const domainOrIP = document.URL.split('/')[2].split(':')[0];
	const host = conInfo.ssl ? `wss://${domainOrIP}` : `ws://${domainOrIP}:${conInfo.port}`;

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

			specialBg = themes.map(theme => theme.name).some(thm => currentBackground.startsWith(`${thm}_`)) ? currentBackground : null;

			switch (data.type) {
				case 'crazyMode':
					if (localStorage.getItem('crazyMode')) howlerList[data.soundFilename].play();
					break;
				case 'notification':
					if (data.notification) document.getElementById('notification').innerText = data.notification.text;
					util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
					break;
				case 'soundModify':
					allSounds[allSounds.findIndex(snd => snd.id === data.sound.id)] = data.sound;
					loadSoundboard(allSounds, specialBg);
					break;
				case 'soundUpload':
					allSounds.push(data.sound);
					loadSoundboard(allSounds, specialBg);
					break;
				case 'soundDelete':
					allSounds.splice(allSounds.findIndex(snd => snd.id === data.sound.id), 1);
					loadSoundboard(allSounds, specialBg);
					break;
				default:
					break;
			}
		});
	});

	document.getElementById('bg-select').addEventListener('change', e => {
		const { value } = e.target;
		currentBackground = value;
		specialBg = themes.map(theme => theme.name).some(thm => currentBackground.startsWith(`${thm}_`)) ? currentBackground : null;

		loadSoundboard(allSounds, specialBg);
	});
});
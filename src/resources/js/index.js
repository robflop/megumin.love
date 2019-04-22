document.addEventListener('DOMContentLoaded', async () => {
	function formatNumber(number) {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	}
	let activatedSounds = [];
	let howlerList = {};

	function toggleButton(hasSounds) {
		const button = document.getElementsByTagName('button')[0];

		if (hasSounds) {
			button.innerText = 'やめろ!!';
			button.disabled = false;
			button.removeAttribute('style');
			// Removes inline CSS but keeps stylesheet intact
		}
		else {
			button.innerText = 'No sounds available.';
			button.style.fontSize = '40px';
			button.style.backgroundColor = '#606060';
			button.style.color = '#383838';
			button.disabled = true;
		}
	}

	function loadSounds(sounds, association = null) {
		const button = document.getElementsByTagName('button')[0];
		howlerList = {}; // Wipe before (re)load

		sounds = sounds.filter(s => s.association === association);
		// Load sounds with either only associated background, or none with an association

		activatedSounds = sounds;

		for (const sound of sounds) {
			howlerList[sound.filename] = new Howl({
				src: `/sounds/${sound.filename}.mp3`
			});
		}

		if (sounds.length > 0 && button.innerText === 'No sounds available.') toggleButton(true);
		if (!sounds.length && button.innerText === 'やめろ!!') toggleButton(false);
	}

	const counterRes = await fetch('/api/counter').then(res => res.json());
	document.getElementById('counter').innerText = formatNumber(counterRes.counter);

	const allSounds = await fetch('/api/sounds').then(res => res.json());
	let currentBackground = localStorage.getItem('background') || '';
	loadSounds(allSounds, currentBackground.startsWith('special_') ? currentBackground : null);

	const conInfo = await fetch('/api/conInfo').then(res => res.json());

	versionsAnchor = document.querySelectorAll("a[href='/versions']")[0];
	trimmedVersion = conInfo.version.substring(0, conInfo.version.lastIndexOf('.'));
	versionsAnchor.innerText = `[ver${trimmedVersion}]`;

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

			currentBackground = localStorage.getItem('background') || '';

			switch (data.type) {
				case 'counterUpdate':
					if (data.counter) document.getElementById('counter').innerText = formatNumber(data.counter);
					break;
				case 'crazyMode':
					if (localStorage.getItem('crazyMode')) howlerList[data.soundFilename].play();
					break;
				case 'notification':
					if (data.notification) document.getElementById('notification').innerText = data.notification.text;
					util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
					break;
				case 'soundModify':
					allSounds[allSounds.findIndex(snd => snd.id === data.sound.id)] = data.sound;
					loadSounds(allSounds, currentBackground.startsWith('special_') ? currentBackground : null);
					break;
				case 'soundUpload':
					allSounds.push(data.sound);
					loadSounds(allSounds, currentBackground.startsWith('special_') ? currentBackground : null);
					break;
				case 'soundDelete':
					allSounds.splice(allSounds.findIndex(snd => snd.id === data.sound.id), 1);
					loadSounds(allSounds, currentBackground.startsWith('special_') ? currentBackground : null);
					break;
				default:
					break;
			}
		});

		document.getElementsByTagName('button')[0].addEventListener('click', e => {
			const sound = activatedSounds[Math.floor(Math.random() * activatedSounds.length)];
			if (sound.filename === 'realname') sound.filename = 'name';

			howlerList[sound.filename].play();

			return ws.send(JSON.stringify({ type: 'click', soundFilename: sound.filename }));
		});
	});

	document.getElementById('bg-select').addEventListener('change', e => {
		const { value } = e.target;

		if (value.startsWith('special_')) loadSounds(allSounds, value);
		else loadSounds(allSounds);
	});

	document.getElementsByTagName('button')[0].addEventListener('keypress', e => {
		if (e.key === 'Enter') return e.preventDefault();
	});
});
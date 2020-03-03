document.addEventListener('DOMContentLoaded', async () => {
	function formatNumber(number) {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	}
	let activatedSounds = [];
	let howlerList = {};

	function setButton(activated) {
		const button = document.getElementsByTagName('button')[0];

		if (activated) {
			button.innerText = 'やめろ!!';
			button.removeAttribute('style');
			// Removes inline CSS but keeps stylesheet intact
			button.disabled = false;
		}
		else {
			button.disabled = true;
			button.innerText = 'No sounds available.';
			button.style.fontSize = '40px';
			button.style.backgroundColor = '#606060';
			button.style.color = '#383838';
		}
	}

	function loadSounds(sounds, bg = null) {
		const button = document.getElementsByTagName('button')[0];
		howlerList = {};

		const bgTheme = themes.find(g => g.backgrounds.some(gBg => gBg.filename === bg));
		if (bgTheme) sounds = sounds.filter(s => s.theme === bgTheme.name);
		else sounds = sounds.filter(s => s.theme === 'megumin');
		// If the bg is associated with a special theme, sort sounds by said theme
		// Otherwise only load default sounds (megumin-related)

		sounds = sounds.filter(s => s.source !== 'no-source' && s.displayname);
		// Only load sounds with source and displayname

		activatedSounds = sounds;

		for (const sound of sounds) {
			const sourceName = sound.source.replace(/\s/g, '-').toLowerCase();

			howlerList[sound.filename] = new Howl({
				src: `/sounds/${sound.theme}/${sourceName}/${sound.filename}.mp3`
			});
		}

		if (sounds.length > 0 && button.disabled) setButton(true);
		if (!sounds.length && !button.disabled) setButton(false);
	}

	const counterRes = await fetch('/api/counter').then(res => res.json());
	document.getElementById('counter').innerText = formatNumber(counterRes.counter);

	const allSounds = await fetch('/api/sounds').then(res => res.json());
	let currentBackground = localStorage.getItem('background') || '';
	let specialBg = themes.map(theme => theme.name).some(thm => currentBackground.startsWith(`${thm}_`)) ? currentBackground : null;
	loadSounds(allSounds, specialBg);

	const meta = await fetch('/api/meta').then(res => res.json());

	versionsAnchor = document.querySelectorAll("a[href='/versions']")[0];
	trimmedVersion = meta.version.substring(0, meta.version.lastIndexOf('.'));
	versionsAnchor.innerText = `[ver${trimmedVersion}]`;

	const domainOrIP = document.URL.split('/')[2].split(':')[0];
	const host = meta.ssl ? `wss://${domainOrIP}` : `ws://${domainOrIP}:${meta.port}`;

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

			specialBg = themes.map(theme => theme.name).some(grp => currentBackground.startsWith(`${grp}_`)) ? currentBackground : null;

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
					loadSounds(allSounds, specialBg);
					break;
				case 'soundUpload':
					allSounds.push(data.sound);
					loadSounds(allSounds, specialBg);
					break;
				case 'soundDelete':
					allSounds.splice(allSounds.findIndex(snd => snd.id === data.sound.id), 1);
					loadSounds(allSounds, specialBg);
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
		currentBackground = value;
		specialBg = themes.map(theme => theme.name).some(grp => currentBackground.startsWith(`${grp}_`)) ? currentBackground : null;

		loadSounds(allSounds, specialBg);
	});

	document.getElementsByTagName('button')[0].addEventListener('keypress', e => {
		if (e.key === 'Enter') return e.preventDefault();
	});
});
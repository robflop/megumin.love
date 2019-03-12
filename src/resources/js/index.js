document.addEventListener('DOMContentLoaded', () => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let sounds = [];
	let howlerList = {};

	function toggleButton(hasSounds) {
		const button = document.getElementsByTagName('button')[0];

		if (hasSounds) {
			button.innerText = 'やめろ!!';
			button.style.fontSize = '65px';
			button.style.backgroundColor = '#ab0000';
			button.style.color = 'ff8080';
			button.disabled = false;
		}
		else {
			button.innerText = 'No sounds available.';
			button.style.fontSize = '40px';
			button.style.backgroundColor = '#606060';
			button.style.color = '#383838';
			button.disabled = true;
		}
	}

	function loadSounds(s) {
		const button = document.getElementsByTagName('button')[0];
		howlerList = {}; // Wipe before (re)load

		for (const sound of sounds) {
			howlerList[sound.filename] = new Howl({
				src: `/sounds/${sound.filename}.mp3`
			});
		}

		if (sounds.length > 0 && button.innerText === 'No sounds available.') toggleButton(true);
		if (!sounds.length && button.innerText === 'やめろ!!') toggleButton(false);
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
						case 'soundRename':
							sounds[sounds.findIndex(snd => snd.id === data.sound.id)] = data.sound;
							loadSounds(sounds);
							break;
						case 'soundUpload':
							sounds.push(data.sound);
							loadSounds(sounds);
							break;
						case 'soundDelete':
							sounds.splice(sounds.findIndex(snd => snd.id === data.sound.id), 1);
							loadSounds(sounds);
							break;
						default:
							break;
					}
				});

				document.getElementsByTagName('button')[0].addEventListener('click', e => {
					const sound = sounds[Math.floor(Math.random() * sounds.length)];
					if (sound.filename === 'realname') sound.filename = 'name';

					ws.send(JSON.stringify({ type: 'click', soundFilename: sound.filename }));

					return howlerList[sound.filename].play();
				});
			});
		});
	});

	document.getElementsByTagName('button')[0].addEventListener('keypress', e => {
		if (e.key === 'Enter') return e.preventDefault();
	});
});
document.addEventListener('DOMContentLoaded', () => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	const characters = { megumin: null, aqua: 'special_true_goddess', darkness: 'special_chivalrous_crusader', kazuma: 'special_equality_advocate' };
	let sounds = [];

	const updateRanking = s => {
		const rankingsWrap = document.getElementById('rankings-wrap');
		rankingsWrap.innerHTML = ''; // Reset to re-populate
		s = s.sort((a, b) => b.count - a.count);

		Object.keys(characters).forEach(character => {
			const listWrap = document.createElement('div');
			listWrap.id = character;
			rankingsWrap.appendChild(listWrap);

			const characterSounds = sounds.filter(snd => snd.association === characters[character]);

			const title = document.createElement('h2');
			title.innerText = character.charAt(0).toUpperCase() + character.slice(1);
			title.classList.add('titles');
			listWrap.appendChild(title);

			if (!characterSounds.length) {
				const warning = document.createElement('h3');
				warning.id = 'warning';
				warning.innerText = 'No sounds available.';

				if (document.getElementById('loading')) document.getElementById('loading').remove();
				return listWrap.appendChild(warning);
			}

			const list = document.createElement('ol');

			for (const sound of characterSounds) {
				if (sound.filename === 'realname') continue;
				const rankingListItem = document.createElement('li');
				rankingListItem.id = sound.filename;
				rankingListItem.innerText = `${sound.displayname}: ${formatNumber(sound.count)} clicks`;

				list.appendChild(rankingListItem);
			}

			listWrap.appendChild(list);
		});

		if (document.getElementById('loading')) document.getElementById('loading').remove();
	};

	fetch('/api/sounds').then(res => res.json()).then(s => {
		sounds = s;
		updateRanking(sounds);
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
						case 'notification':
							if (data.notification) document.getElementById('notification').innerText = data.notification.text;
							util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
							break;
						case 'soundClick': // Same code because a click modifies the sound object just like a modification would
						case 'soundModify':
							sounds[sounds.findIndex(snd => snd.id === data.sound.id)] = data.sound;
							updateRanking(sounds);
							break;
						case 'soundUpload':
							sounds.push(data.sound);
							updateRanking(sounds);
							break;
						case 'soundDelete':
							sounds.splice(sounds.findIndex(snd => snd.id === data.sound.id), 1);
							updateRanking(sounds);
							break;
						default:
							break;
					}
				});
			});
		});
	});
});
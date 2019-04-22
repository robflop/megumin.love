document.addEventListener('DOMContentLoaded', async () => {
	function formatNumber(number) {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	}
	const characters = { megumin: null, aqua: 'special_true_goddess', darkness: 'special_chivalrous_crusader', kazuma: 'special_equality_advocate' };

	function updateRankings(s) {
		const rankingsWrap = document.getElementById('rankings-wrap');
		rankingsWrap.innerHTML = ''; // Reset to re-populate
		sounds = s.sort((a, b) => b.count - a.count);

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
				if (!sound.displayname || !sound.source) continue;
				// Don't list those without displayname or source
				const rankingListItem = document.createElement('li');
				rankingListItem.id = sound.filename;
				rankingListItem.innerText = `${sound.displayname}: ${formatNumber(sound.count)} clicks`;

				list.appendChild(rankingListItem);
			}

			listWrap.appendChild(list);
		});

		if (document.getElementById('loading')) document.getElementById('loading').remove();
	}

	let sounds = await fetch('/api/sounds').then(res => res.json());
	updateRankings(sounds);

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

			switch (data.type) {
				case 'notification':
					if (data.notification) document.getElementById('notification').innerText = data.notification.text;
					util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
					break;
				case 'soundClick':
				case 'soundModify':
					sounds[sounds.findIndex(snd => snd.id === data.sound.id)] = data.sound;
					updateRankings(sounds);
					break;
				case 'soundUpload':
					sounds.push(data.sound);
					updateRankings(sounds);
					break;
				case 'soundDelete':
					sounds.splice(sounds.findIndex(snd => snd.id === data.sound.id), 1);
					updateRankings(sounds);
					break;
				default:
					break;
			}
		});
	});
});
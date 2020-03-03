document.addEventListener('DOMContentLoaded', async () => {
	function formatNumber(number) {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	}
	const characters = themes.map(theme => {
		return { theme: theme.name, title: theme.title };
	});

	function updateRankings(s) {
		const rankingsWrap = document.getElementById('rankings-wrap');
		rankingsWrap.innerHTML = ''; // Reset to re-populate
		sounds = s.sort((a, b) => b.count - a.count);

		characters.forEach(character => {
			const listWrap = document.createElement('div');
			listWrap.id = character;
			rankingsWrap.appendChild(listWrap);

			const characterSounds = sounds.filter(snd => snd.theme === character.theme);

			const title = document.createElement('h2');
			title.innerText = character.title;
			title.classList.add('titles');
			listWrap.appendChild(title);

			if (!characterSounds.filter(snd => snd.displayname).length) {
				const warning = document.createElement('h3');
				warning.id = 'warning';
				warning.innerText = 'No sounds available.';

				if (document.getElementById('loading')) document.getElementById('loading').remove();
				return listWrap.appendChild(warning);
			}

			const list = document.createElement('ol');

			for (const sound of characterSounds) {
				if (!sound.displayname || sound.source === 'no-source') continue;
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

	const meta = await fetch('/api/meta').then(res => res.json());

	const wsAddress = document.location.protocol === 'https:' ? `wss://${document.location.host}` : `ws://${document.location.host}`;
	const ws = new WebSocket(wsAddress);

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
				case 'soundUpdate':
					sounds[data.soundFilename].count++;
					updateRankings(sounds);
					break;
				case 'bulkSoundUpdate':
					data.sounds = JSON.parse(data.sounds);
					Object.keys(data.sounds).forEach(s => {
						const sound = sounds[sounds.findIndex(snd => snd.filename === s)];
						sound.count = sound.count + data.sounds[s];
					});
					updateRankings(sounds);
					break;
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
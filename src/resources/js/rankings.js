document.addEventListener('DOMContentLoaded', () => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let sounds = [];

	const updateRanking = s => {
		const rankings = document.getElementsByTagName('ol')[0];
		s = s.sort((a, b) => b.count - a.count);

		while (rankings.hasChildNodes()) rankings.removeChild(rankings.lastChild);

		if (s.length === 0) {
			const warning = document.createElement('h1');
			warning.id = 'warning';
			warning.innerText = 'No sounds available.';

			return rankings.appendChild(warning);
		}

		for (const sound of s) {
			if (sound.filename === 'realname') continue;
			const soundListItem = document.createElement('li');
			soundListItem.id = sound.filename;
			soundListItem.innerText = `${sound.displayname}: ${formatNumber(sound.count)} clicks`;

			rankings.appendChild(soundListItem);
		}

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

					if (!['counterUpdate', 'soundUpdate', 'crazyMode', 'notification'].includes(data.type)) return;

					if (data.type === 'soundUpdate' && data.sounds) {
						data.sounds.changedSounds.map(changedSound => sounds[sounds.findIndex(snd => snd.id === changedSound.id)] = changedSound);
						data.sounds.deletedSounds.map(deletedSound => sounds.splice(sounds.findIndex(snd => snd.id === deletedSound.id), 1));
						data.sounds.addedSounds.map(addedSound => sounds.push(addedSound));
						// Compare IDs because all other fields may have changed, id the only constant

						return updateRanking(sounds);
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
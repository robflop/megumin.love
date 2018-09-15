$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let sounds = [];

	const updateRanking = s => {
		s = s.sort((a, b) => b.count - a.count);

		$('#rankings').children().detach();

		if (s.length === 0) $('#rankings').append('<h1 id="warning">No sounds available.</h1>');

		for (const sound of s) {
			if (sound.filename === 'realname') continue;

			$('#rankings').append(`<li id=${sound.filename}>${sound.displayname}: ${formatNumber(sound.count)} clicks</li>`);
		}

		if ($('#loading')) $('#loading').remove();
	};

	$.get('/api/conInfo').done(con => {
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
					data.sounds.changedSounds.map(changedSound => sounds[sounds.findIndex(s => s.filename === changedSound.filename)] = changedSound);
					data.sounds.deletedSounds.map(deletedSound => sounds.splice(sounds.findIndex(s => s.filename === deletedSound.filename), 1));
					data.sounds.addedSounds.map(addedSound => sounds.push(addedSound));

					return updateRanking(sounds);
				}
				else if (data.type === 'notification' && data.notification) {
					$('#notification').text(data.notification.text);
					return $('#notification-wrapper').fadeIn().fadeOut(data.notification.duration * 1000);
				}
			});
		});
	});

	$.get('/api/sounds').done(s => {
		sounds = s;
		updateRanking(sounds);
	});
});
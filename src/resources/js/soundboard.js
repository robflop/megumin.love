$(document).ready(() => {
	let sounds = [];
	let howlerList = {};
	let ws;

	function loadSoundboard(s) {
		howlerList = {}; // Wipe before (re)load
		sounds = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons

		$('#container').html('<p id="loading" style="text-align:center;font-size:48px;margin:0 auto;">Loading...</p>');
		// Reset container

		if (sounds.length === 0) {
			return $('#container').html(`
			<div id="backlink-top"><a class="backlink" href="/">Back</a></div>
			<a href="rankings" id="rankings">Rankings</a>
			<p id="warning" class="titles" style="font-size:50px">No sounds available.</p>
			<div id="backlink-bottom"><a class="backlink" href="/">Back</a></div>
			`);
		}

		$('#container').append('<div id="backlink-top"><a class="backlink" href="/">Back</a></div>');
		$('#container').append('<a href="rankings" id="rankings">Rankings</a>');

		// Create buttons and make them play corresponding sounds
		for (const sound of sounds) {
			const sourceName = sound.source.replace(/\s/g, '-').toLowerCase();
			const sourceButtonWrapper = $(`div.buttons-wrapper#${sourceName}-buttons`);
			// Source as in "Season 1", "Season 1 OVA", etc

			howlerList[sound.filename] = new Howl({
				src: [`/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.mp3`],
			});

			if (sound.filename === 'realname') continue;
			// Don't create button for this one

			if (sourceButtonWrapper.length) {
				sourceButtonWrapper.append(`<button id=${sound.filename}>${sound.displayname}</button>`);
			}
			else {
				// Use appendTo below to get reference to newly created elements to append other elements to
				const sourceWrapper = $(`<div class="source-wrappers"></div>`).appendTo('#container');
				sourceWrapper.append(`<h1 class="titles">${sound.source}:</h1>`);
				const sourceButtonsWrapper = $(`<div class="buttons-wrapper" id="${sourceName}-buttons">`).appendTo(sourceWrapper);
				if (!$(`#${sound.filename}`).length) sourceButtonsWrapper.append(`<button id=${sound.filename}>${sound.displayname}</button>`);
			}

			if (sound.filename === 'name') {
				$('#name').click(() => {
					const rsound = Math.floor(Math.random() * 100) + 1;

					if (rsound === 42) {
						howlerList.realname.play();
						ws.send(JSON.stringify({ type: 'sbClick', sound: sound.filename }));
					}
					else {
						howlerList.name.play();
						ws.send(JSON.stringify({ type: 'sbClick', sound: sound.filename }));
					}
				});

				continue;
				// Create button but don't use standard click function
			}

			$(`#${sound.filename}`).click(() => {
				howlerList[sound.filename].play();
				ws.send(JSON.stringify({ type: 'sbClick', sound: sound.filename }));
			});

			$(`#${sound.filename}`).keypress(key => {
				if (key.which === 13) return key.preventDefault();
				// Don't trigger the button on 'enter' keypress
			});
		}

		$('#container').append('<div id="backlink-bottom"><a class="backlink" href="/">Back</a></div>');
		$('#loading').remove();
	}

	$.get('/api/sounds').done(s => {
		sounds = s;
		loadSoundboard(sounds);

		$.get('/api/conInfo').done(con => {
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

					if (!['counterUpdate', 'soundUpdate', 'crazyMode', 'notification'].includes(data.type)) return;

					if (data.type === 'soundUpdate' && data.sounds) loadSoundboard(data.sounds);
					if (data.type === 'crazyMode' && localStorage.getItem('crazyMode')) howlerList[data.sound].play();
					if (data.type === 'notification' && data.notification) {
						$('#notification').text(data.notification.text);
						$('#notification-wrapper').fadeIn().fadeOut(data.notification.duration * 1000);
					}
				});
			});
		});
	});
});
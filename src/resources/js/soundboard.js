$(document).ready(() => {
	// background

	const backgroundCookie = (document.cookie.split(';').find(cookie => cookie.trim().startsWith('background')) || '').trim();
	const background = backgroundCookie.substr(backgroundCookie.indexOf('=') + 1);
	const randomBg = ['bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg5.jpg', 'bg6.jpg'][Math.round(Math.random() * 5)];

	if (background === 'rotate' || !background) {
		// falsy check for if no selection has been made, and thus is on standard
		$('body').css('background-image', `url(/images/backgrounds/${randomBg})`);
	}
	else {
		$('body').css('background-image', `url(/images/backgrounds/${background}.jpg)`);
	}

	$('#bg-select').val(background || 'rotate');

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'rotate') $('body').css('background-image', `url(/images/backgrounds/${this.value}.jpg)`);
		return document.cookie = `background=${this.value}`;
		/* eslint-enable no-invalid-this */
	});

	// actual functionality

	let sounds = [];
	let howlerList = {};
	let ws;

	function loadSoundboard(s) {
		howlerList = {}; // wipe before (re)load
		sounds = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// sort primarily by season and secondarily alphabetically within seasons

		$('#container').html('<p id="loading" style="text-align:center;font-size:48px;margin:0 auto;">Loading...</p>'); // reset container

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
			const source = $(`div.buttons-wrap.source-${sound.source.replace(/\s/g, '-').toLowerCase()}`);

			howlerList[sound.filename] = new Howl({
				src: [`/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.mp3`],
			});

			if (sound.filename === 'realname') continue;
			// don't create button for this one

			if (source.length) {
				source.append(`<button id=${sound.filename}>${sound.displayname}</button>`);
			}
			else {
				$('#container').append(`<h1 class="titles">${sound.source}:</h1>`);
				const buttonsWrap = $(`<div class="buttons-wrap source-${sound.source.replace(/\s/g, '-').toLowerCase()}">`).appendTo('#container');
				// use appendTo to get reference to newly-created wrapper in return value which is then appended to
				if (!$(`#${sound.filename}`).length) buttonsWrap.append(`<button id=${sound.filename}>${sound.displayname}</button>`);
			}

			if (sound.filename === 'name') {
				$('#name').click(() => {
					const rsound = Math.floor(Math.random() * 100) + 1;

					if (rsound === 42) {
						howlerList.realname.play();
						ws.send(JSON.stringify({ type: 'sbClick', sound: sounds.find(s => s.filename === 'realname') }));
					}
					else {
						howlerList.name.play();
						ws.send(JSON.stringify({ type: 'sbClick', sound: sounds.find(s => s.filename === 'name') }));
					}
				});

				continue;
				// create button but don't use standard click function
			}

			$(`#${sound.filename}`).click(() => {
				howlerList[sound.filename].play();

				ws.send(JSON.stringify({ type: 'sbClick', sound: sounds.find(snd => snd.filename === sound.filename) }));
			});

			$(`#${sound.filename}`).keypress(key => {
				if (key.which === 13) return key.preventDefault();
				// don't trigger the button on 'enter' keypress
			});
		}

		$('#container').append('<div id="backlink-bottom"><a class="backlink" href="/">Back</a></div>');
		$('#loading').remove();
	}

	$.get('/sounds').done(s => {
		sounds = s;
		loadSoundboard(sounds);

		$.get('/conInfo').done(con => {
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

					if (!['counterUpdate', 'soundUpdate'].includes(data.type)) return;

					if (data.type === 'soundUpdate' && data.values.sounds) return loadSoundboard(data.values.sounds);
				});
			});
		});
	});
});
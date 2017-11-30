$(document).ready(() => {
	// background

	const backgroundCookie = (document.cookie.split(';').find(cookie => cookie.trim().startsWith('background')) || '').trim();
	const background = backgroundCookie.substr(backgroundCookie.indexOf('=') + 1);

	if (background === 'rotate' || !background) {
		// falsy check for if no selection has been made, and thus is on standard
		$('body').css('background-image', `url(/images/${['bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg'][Math.round(Math.random() * 3)]})`);
	}
	else {
		$('body').css('background-image', `url(/images/${background}.jpg)`);
	}

	$('#bg-select').val(background || 'rotate');

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'rotate') $('body').css('background-image', `url(/images/${this.value}.jpg)`);
		return document.cookie = `background=${this.value}`;
		/* eslint-enable no-invalid-this */
	});

	// actual functionality

	let socket;
	const howlerList = {};

	$.get('/conInfo').done(con => {
		const domainOrIP = document.URL.split('/')[2].split(':')[0];
		const host = con.ssl ? `https://${domainOrIP}` : `http://${domainOrIP}:${con.port}`;

		socket = io.connect(host);
	});

	$('#container').append('<a href="/" id="backlink-top" class="backlink">Back</a>');
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
			source.append(`<button id=${sound.filename}>${sound.displayName}</button>`);
		}
		else {
			$('#container').append(`<div class="titles">${sound.source}:</div>`);
			$(`<div class="buttons-wrap source-${sound.source.replace(/\s/g, '-').toLowerCase()}">`)
				.appendTo('#container')
				.append(`<button id=${sound.filename}>${sound.displayName}</button>`);
			// use appendTo to get reference to newly-created wrapper in return value which is then appended to
		}

		if (sound.filename === 'name') {
			$('#name').click(() => {
				const rsound = Math.floor(Math.random() * 100) + 1;

				if (rsound === 42) {
					howlerList.realname.play();
					socket.emit('sbClick', sounds.find(s => s.filename === 'realname'));
				}
				else {
					howlerList.name.play();
					socket.emit('sbClick', sounds.find(s => s.filename === 'name'));
				}
			});

			continue;
			// create button but don't use standard click function
		}

		$(`#${sound.filename}`).click(() => {
			howlerList[sound.filename].play();

			socket.emit('sbClick', sounds.find(s => s.filename === sound.filename));
		});

		$(`#${sound.filename}`).keypress(key => {
			if (key.which === 13) return key.preventDefault();
			// don't trigger the button on 'enter' keypress
		});
	}

	$('#container').append('<a href="/" id="backlink-bottom" class="backlink">Back</a>');
	$('#loading').remove();
});
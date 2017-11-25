$(document).ready(() => {
	let socket;

	$.get('/conInfo').done(con => {
		const domainOrIP = document.URL.split('/')[2].split(':')[0];
		const host = con.ssl ? `https://${domainOrIP}` : `http://${domainOrIP}:${con.port}`;

		socket = io.connect(host);
	});

	const howlerList = {};

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
				let sbSound;
				if (rsound === 42) {
					howlerList.realname.play();
					sbSound = sounds.find(s => s.filename === 'realname');
				}
				else {
					howlerList.name.play();
					sbSound = sounds.find(s => s.filename === 'name');
				}
				socket.emit('sbClick', sbSound);
			});
			continue;
		// create button but don't use standard click function
		}

		$(`#${sound.filename}`).click(() => {
			const sbSound = sounds.find(s => s.filename === sound.filename);
			howlerList[sound.filename].play();
			socket.emit('sbClick', sbSound);
		});

		$(`#${sound.filename}`).keypress(key => {
			if (key.which === 13) return key.preventDefault();
			// don't trigger the button on 'enter' keypress
		});
	}

	$('#container').append('<a href="/" id="backlink-bottom" class="backlink">Back</a>');
	$('#loading').remove();
});
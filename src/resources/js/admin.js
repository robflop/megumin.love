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

	const updateSounds = () => {
		$.get('/counter?sounds').done(sounds => {
			const options = sounds.map(sound => `<option value=${sound.filename}>${sound.displayname} (${sound.filename}, ${sound.source})</option>`);

			$('#rename-select').html(options.join(''));
			$('#delete-select').html(options.join(''));
		});
	};

	$.get('/conInfo').done(con => {
		const domainOrIP = document.URL.split('/')[2].split(':')[0];
		const host = con.ssl ? `wss://${domainOrIP}` : `ws://${domainOrIP}:${con.port}`;

		updateSounds();

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

				if (data.type !== 'update') return;

				console.log(data);
			});
		});
	});

	$('#logout').click(e => {
		e.preventDefault();

		$.get('/api/logout').done(res => {
			if (res.code === 200) return window.location.href = '/';
		});
	});

	$('#upload-form').submit(e => {
		e.preventDefault();

		const textData = $('#upload-form').serializeArray();
		const fileData = $('#upload-form')[0][0].files;
		console.log(textData, fileData);

		$.post('/api/upload', {
			files: fileData,
			filename: textData[0].value,
			displayname: textData[1].value,
			source: textData[2].value
		}).done(res => {
			if (res.code === 200) {
				setTimeout(() => {
					$('#upload-res').text('Sound successfully renamed!');
					return updateSounds();
				}, 1000 * 0.5);
				// use a timeout to give server necessary time to update data
			}
			else {
				return $('#upload-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
			}
		});
	});

	$('#rename-form').submit(e => {
		e.preventDefault();

		const data = $('#rename-form').serializeArray();

		$.post('/api/rename', {
			oldSound: data[0].value,
			newFilename: data[1].value,
			newDisplayname: data[2].value,
			newSource: data[3].value
		}).done(res => {
			if (res.code === 200) {
				setTimeout(() => {
					$('#rename-res').text('Sound successfully renamed!');
					return updateSounds();
				}, 1000 * 0.5);
				// use a timeout to give server necessary time to update data
			}
			else {
				return $('#rename-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
			}
		});
	});

	$('#delete-form').submit(e => {
		e.preventDefault();

		const data = $('#delete-form').serializeArray();

		$.post('/api/delete', { sound: data[0].value }).done(res => {
			if (res.code === 200) {
				setTimeout(() => {
					$('#delete-res').text('Sound successfully deleted!');
					return updateSounds();
				}, 1000 * 0.5);
				// use a timeout to give server necessary time to update data
			}
			else {
				return $('#delete-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
			}
		});
	});
});
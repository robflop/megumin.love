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

	$.get('/conInfo').done(con => {
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

				if (data.type !== 'update') return;

				console.log(data);
			});
		});
	});

	$('#logout').click(e => {
		$.get('/api/logout').done(res => {
			if (res.code === 200) return window.location.href = '/';
		});
		e.preventDefault();
	});

	$.get('/counter?sounds').done(sounds => {
		const options = sounds.map(sound => `<option value=${sound.filename}>${sound.displayname} (${sound.filename}, ${sound.source})</option>`);

		$('#rename-select').html(options.join(''));
		$('#delete-select').html(options.join(''));
	});

	$('#upload-form').submit(e => {
		$.post('/api/upload', { sound: '' }).done(res => {
			// stuff
		});
		e.preventDefault();
	});


	$('#rename-form').submit(e => {
		$.post('/api/rename', { oldSound: '', newSound: '' }).done(res => {
			// stuff
		});
		e.preventDefault();
	});

	$('#delete-form').submit(e => {
		$.post('/api/delete', { sound: '' }).done(res => {
			// stuff
		});
		e.preventDefault();
	});
});
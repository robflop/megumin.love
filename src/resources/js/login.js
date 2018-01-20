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

	$('#login').submit(e => {
		$.post('/api/login', { password: $('#login').serializeArray()[0].value }).done(res => {
			if (res.code === 200) return window.location.href = '/admin';
			else return $('#login-res').text(`Errorcode ${res.code}: ${res.message}`).fadeIn().fadeOut(2000);
		});
		e.preventDefault();
	});
});
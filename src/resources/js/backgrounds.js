$(document).ready(() => {
	const background = (document.cookie.split(';').find(cookie => cookie.trim().startsWith('background')) || '').trim().substr(11) || 'rotate';
	// the 11 in the substring is the length of "background=" to get the cookie value
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6'];
	const randomBg = backgrounds[Math.round(Math.random() * backgrounds.length)];

	$('body').css('background-image', `url(/images/backgrounds/${background !== 'rotate' ? background : randomBg}.jpg)`);

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'rotate') $('body').css('background-image', `url(/images/backgrounds/${this.value}.jpg)`);
		return document.cookie = `background=${this.value}`;
		/* eslint-enable no-invalid-this */
	});

	const bgOptions = backgrounds.map(bg => `<option value=${bg}>Background ${bg.substr(2)}</option>`);
	bgOptions.unshift('<option value="rotate">Rotate all (on F5)</option>');

	$('#bg-select').html(bgOptions.join('')).val(background);
});
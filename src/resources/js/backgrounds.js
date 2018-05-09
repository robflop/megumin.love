$(document).ready(() => {
	const background = (document.cookie.split(';').find(cookie => cookie.trim().startsWith('background')) || '').trim().substr(11) || 'random';
	// the 11 in the substring is the length of "background=" to get the cookie value
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8'];
	const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	$('body').css('background-image', `url(/images/backgrounds/${background !== 'random' ? background : randomBg}.jpg)`);

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'random') $('body').css('background-image', `url(/images/backgrounds/${this.value}.jpg)`);
		return document.cookie = `background=${this.value}`;
		/* eslint-enable no-invalid-this */
	});

	const bgOptions = backgrounds.map(bg => `<option value=${bg}>Background ${bg.substr(2)}</option>`);
	bgOptions.unshift('<option value="random">Randomize (on F5)</option>');

	$('#bg-select').html(bgOptions.join('')).val(background);
});
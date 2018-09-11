$(document).ready(() => {
	/* Backgrounds */

	// const background = (document.cookie.split(';').find(cookie => cookie.trim().startsWith('background')) || '').trim().substr(11) || 'random';
	const background = localStorage.getItem('background') || 'random';
	// The 11 in the substring is the length of "background=" to get the cookie value
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8'];
	const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	$('body').css('background-image', `url(/images/backgrounds/${background !== 'random' && background !== 'rotate' ? background : randomBg}.jpg)`);
	// Remove the "rotate" backwards compatibility thing somewhen later

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'random') $('body').css('background-image', `url(/images/backgrounds/${this.value}.jpg)`);
		return localStorage.setItem('background', this.value);
		// return document.cookie = `background=${this.value}`;
		/* eslint-enable no-invalid-this */
	});

	const bgOptions = backgrounds.map(bg => `<option value=${bg}>Background ${bg.substr(2)}</option>`);
	bgOptions.unshift('<option value="random">Randomize (on F5)</option>');

	$('#bg-select').html(bgOptions.join('')).val(background);

	/* Crazy mode */

	// let crazyMode = document.cookie.split(';').find(cookie => cookie.trim().startsWith('crazyMode')) ? true : false;
	let crazyMode = localStorage.getItem('crazyMode');
	$('#crazymode-toggle').prop('checked', crazyMode);
	$('#crazymode-toggle').change(function() {
		/* eslint-disable no-invalid-this */
		// if (!this.checked) document.cookie = 'crazyMode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
		if (!this.checked) localStorage.removeItem('crazyMode');
		// else document.cookie = 'crazyMode=true';
		else localStorage.setItem('crazyMode', true);

		return crazyMode = this.checked;
		/* eslint-enable no-invalid-this */
	});
});
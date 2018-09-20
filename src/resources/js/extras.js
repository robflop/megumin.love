$(document).ready(() => {
	/* Backgrounds */

	const background = localStorage.getItem('background') || 'random';
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8'];
	const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	$('body').css('background-image', `url(/images/backgrounds/${background === 'random' ? randomBg : background}.jpg)`);

	$('#bg-select').change(function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'random') $('body').css('background-image', `url(/images/backgrounds/${this.value}.jpg)`);
		return localStorage.setItem('background', this.value);
		/* eslint-enable no-invalid-this */
	});

	const bgOptions = backgrounds.map(bg => `<option value=${bg}>Background ${bg.substr(2)}</option>`);
	bgOptions.unshift('<option value="random">Randomize (on F5)</option>');

	$('#bg-select').html(bgOptions.join('')).val(background);

	/* Crazy mode */

	let crazyMode = localStorage.getItem('crazyMode');
	$('#crazymode-toggle').prop('checked', crazyMode);
	$('#crazymode-toggle').change(function() {
		/* eslint-disable no-invalid-this */
		if (!this.checked) localStorage.removeItem('crazyMode');
		else localStorage.setItem('crazyMode', true);

		return crazyMode = this.checked;
		/* eslint-enable no-invalid-this */
	});
});
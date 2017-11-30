$(document).ready(() => {
	const background = (document.cookie.split(';').find(cookie => cookie.startsWith('background')) || '').substr(11).trim();
	// substr 11 is to get value of the cookie, trim is to remove trailing whitespace due to having cut preceeding cookies

	if (background === 'rotate' || !background) {
		// falsy check for if no selection has been made, and thus is on standard
		$('body').css('background-image', `url(/images/${['bg1.jpg', 'bg2.jpg', 'bg3.jpg'][Math.round(Math.random() * 2)]})`);
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
});
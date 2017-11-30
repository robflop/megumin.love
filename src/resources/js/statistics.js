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

	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

	const updateStatistics = statistics => {
		$('#alltime').html(`All-time clicks: ${formatNumber(statistics.alltime)}`);
		$('#today').html(`Today's clicks: ${formatNumber(statistics.daily)}`);
		$('#week').html(`This week's clicks: ${formatNumber(statistics.weekly)}`);
		$('#month').html(`This month's clicks: ${formatNumber(statistics.monthly)}`);
		$('#average').html(`Average clicks a day (in this month): ~${formatNumber(statistics.average)}`);
	};

	$.get('/conInfo').done(con => {
		const domainOrIP = document.URL.split('/')[2].split(':')[0];
		const host = con.ssl ? `https://${domainOrIP}` : `http://${domainOrIP}:${con.port}`;

		const socket = io.connect(host);
		socket.on('update', data => data.statistics ? updateStatistics(data.statistics) : null);
	});

	$.get('/counter?statistics').done(statistics => updateStatistics(statistics));
});
$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

	const updateStatistics = statistics => {
		$('#alltime').html(`All-time clicks: ${formatNumber(statistics.alltime)}`);
		$('#daily').html(`Today's clicks: ${formatNumber(statistics.daily)}`);
		$('#weekly').html(`This week's clicks: ${formatNumber(statistics.weekly)}`);
		$('#monthly').html(`This month's clicks: ${formatNumber(statistics.monthly)}`);
		$('#yearly').html(`This year's clicks: ${formatNumber(statistics.yearly)}`);
		$('#average').html(`Average clicks a day (in this month): ~${formatNumber(statistics.average)}`);
	};

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

				if (!['counterUpdate', 'notification'].includes(data.type)) return;

				if (data.statistics) updateStatistics(data.statistics);
				// only numbers ever get updated here, no need to differentiate the events
				else if (data.type === 'notification' && data.notification) {
					$('#notification').text(data.notification.text);
					$('#notification-wrapper').fadeIn().fadeOut(data.notification.duration * 1000);
				}
			});
		});
	});

	$.get('/counter?statistics').done(statistics => updateStatistics(statistics));
});
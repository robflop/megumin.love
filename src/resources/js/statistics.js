$(document).ready(() => {
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

				if (!['counterUpdate', 'soundUpdate'].includes(data.type)) return;

				if (data.values.statistics) return updateStatistics(data.values.statistics);
				// only numbers ever get updated here, no need to differentiate the two events
			});
		});
	});

	$.get('/counter?statistics').done(statistics => updateStatistics(statistics));
});
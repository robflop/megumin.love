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
		const host = con.ssl ? `https://${domainOrIP}` : `http://${domainOrIP}:${con.port}`;

		const socket = io.connect(host);
		socket.on('update', data => data.statistics ? updateStatistics(data.statistics) : null);
	});

	$.get('/counter?statistics').done(statistics => updateStatistics(statistics));
});
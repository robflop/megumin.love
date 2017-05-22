$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

	const domainOrIP = document.URL.split('/')[2].split(':')[0];
	let host = `http://${domainOrIP}`;
	let socket;

	$.get('/conInfo').done(con => {
		const port = con.port, SSLproxy = con.ssl;
		host = SSLproxy ? host.replace('http', 'https') : host += `:${port}`;

		socket = io.connect(host);
		socket.on('update', data => {
			$('#alltime').html(`All-time clicks: ${formatNumber(data.statistics.alltime)}`);
			$('#today').html(`Today's clicks: ${formatNumber(data.statistics.today)}`);
			$('#week').html(`This week's clicks: ${formatNumber(data.statistics.week)}`);
			$('#month').html(`This month's clicks: ${formatNumber(data.statistics.month)}`);
			$('#average').html(`Average clicks a day (in last this month): ~${formatNumber(data.statistics.average)}`);
		});
	});

	$.get('/counter?statistics').done(statistics => {
		$('#alltime').html(`All-time clicks: ${formatNumber(statistics.alltime)}`);
		$('#today').html(`Today's clicks: ${formatNumber(statistics.today)}`);
		$('#week').html(`This week's clicks: ${formatNumber(statistics.week)}`);
		$('#month').html(`This month's clicks: ${formatNumber(statistics.month)}`);
		$('#average').html(`Average clicks a day (in this month): ~${formatNumber(statistics.average)}`);
	});
});
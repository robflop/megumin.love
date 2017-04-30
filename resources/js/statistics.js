$(document).ready(function() {
	const formatNumber = (number) => {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
	};

	const domainOrIP = document.URL.split('/')[2].split(':')[0];
	let host = 'http://'+domainOrIP;
	let socket;

	$.get("/conInfo").done((res) => {
		const port = res[0], SSLproxy = res[1];
		host = SSLproxy ? host.replace("http", "https") : host += `:${port}`;

		socket = io.connect(host);
		socket.on('update', function(data) {
			$('#alltime').html(`All-time clicks: ${formatNumber(data.statistics.alltime)}`);
			$('#today').html(`Today's clicks: ${formatNumber(data.statistics.today)}`);
			$('#week').html(`Past 7 days' clicks: ${formatNumber(data.statistics.week)}`);
			$('#month').html(`Past 31 days' clicks: ${formatNumber(data.statistics.month)}`);
			$('#average').html(`Average clicks a day (in last 31 days): ~${formatNumber(data.statistics.average)}`);
		});
	});

	$.get("/counter?statistics=alltime").done((res) => $('#alltime').html(`All-time clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=today").done((res) => $('#today').html(`Today's clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=week").done((res) => $('#week').html(`Past 7 days' clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=month").done((res) => $('#month').html(`Past 31 days' clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=average").done((res) => $('#average').html(`Average clicks a day (in last 31 days): ~${formatNumber(res)}`));
});
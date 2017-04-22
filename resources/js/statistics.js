$(document).ready(function() {
	const formatNumber = (number) => {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
	};

	let socket;
	$.get("/port").done((res) => {
		socket = io.connect('localhost:'+res);
		socket.on('update', function(data) {
			$('#alltime').html(`All-time clicks: ${formatNumber(data.statistics.alltime)}`);
			$('#today').html(`Today's clicks: ${formatNumber(data.statistics.today)}`);
			$('#week').html(`Past 7 days' clicks: ${formatNumber(data.statistics.week)}`);
			$('#month').html(`Past 31 days' clicks: ${formatNumber(data.statistics.month)}`);
			$('#average').html(`Average clicks a day (in last month): ~${formatNumber(data.statistics.average)}`);
		});
	});

	$.get("/counter?statistics=alltime").done((res) => $('#alltime').html(`All-time clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=today").done((res) => $('#today').html(`Today's clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=week").done((res) => $('#week').html(`Past 7 days' clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=month").done((res) => $('#month').html(`Past 31 days' clicks: ${formatNumber(res)}`));
	$.get("/counter?statistics=average").done((res) => $('#average').html(`Average clicks a day (in last month): ~${formatNumber(res)}`));
});
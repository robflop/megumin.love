$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	const statistics = {};
	const chartContext = $('#monthly-chart');
	const tickArray = [50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 1000000, 2500000, 5000000, 10000000, 20000000, 40000000];

	// Establish basic chart model without data
	const chart = new Chart(chartContext, {
		type: 'line',
		data: {
			labels: [],
			datasets: [{
				data: [],
				label: 'Clicks',
			}]
		},
		options: {
			scales: {
				yAxes: [{
					type: 'logarithmic',
					ticks: {
						callback: tick => tick.toLocaleString('de-DE'),
						min: 30000,
						max: 50000000
					},
					afterBuildTicks: axis => axis.ticks = tickArray
				}]
			},
			tooltips: {
				callbacks: {
					label: (tItems, lData) => `${lData.datasets[0].data[tItems.index].toLocaleString('de-DE')}`
				}
			}
		}
	});

	const updateStatistics = stats => {
		$('#alltime').html(`All-time clicks: ${formatNumber(stats.summary.alltime)}`);
		$('#daily').html(`Today's clicks: ${formatNumber(stats.summary.daily)}`);
		$('#weekly').html(`This week's clicks: ${formatNumber(stats.summary.weekly)}`);
		$('#monthly').html(`This month's clicks: ${formatNumber(stats.summary.monthly)}`);
		$('#yearly').html(`This year's clicks: ${formatNumber(stats.summary.yearly)}`);
		$('#average').html(`Average clicks a day (in this month): ~${formatNumber(stats.summary.average)}`);

		chart.data.labels = stats.chartData.map(entry => entry = entry.month);
		chart.data.datasets[0].data = stats.chartData.map(entry => entry = entry.clicks);
		chart.update();
	};

	$.when(
		$.get('/api/statistics/summary', summary => {
			return statistics.summary = summary;
		}),

		$.get('/api/statistics/chartData').done(cData => {
			return statistics.chartData = cData;
		})
	).then(() => {
		updateStatistics(statistics);

		$.get('/api/conInfo').done(con => {
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

					if (!['counterUpdate', 'soundUpdate', 'crazyMode', 'notification'].includes(data.type)) return;

					if (data.type === 'counterUpdate' && data.statistics) {
						if (data.statistics.newChartData) {
							statistics.chartData[statistics.chartData.length - 1] = data.statistics.newChartData;
						}
						statistics.summary = data.statistics.summary;

						return updateStatistics(statistics);
					}
					else if (data.type === 'notification' && data.notification) {
						$('#notification').text(data.notification.text);
						return $('#notification-wrapper').fadeIn().fadeOut(data.notification.duration * 1000);
					}
				});
			});
		});
	});
});
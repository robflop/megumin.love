$(document).ready(() => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

	const updateRanking = rankings => {
		$('#rankings').children('li').detach();

		for (const rank of rankings) {
			if (rank.filename === 'realname') continue;

			$('#rankings').append(`<li id=${rank.filename}>${rank.displayName}: ${formatNumber(rank.count)} clicks</li>`);
		}

		if ($('#loading')) $('#loading').remove();
	};

	$.get('/conInfo').done(con => {
		const domainOrIP = document.URL.split('/')[2].split(':')[0];
		const host = con.ssl ? `https://${domainOrIP}` : `http://${domainOrIP}:${con.port}`;

		const socket = io.connect(host);
		socket.on('update', data => updateRanking(data.rankings));
	});

	$.get('/counter?rankings').done(rankings => updateRanking(rankings));
});
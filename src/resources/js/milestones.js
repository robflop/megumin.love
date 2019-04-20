document.addEventListener('DOMContentLoaded', () => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	let milestones = [];

	function updateMilestones(milestone) {
		// TODO: Create and update html elements n stuff
	}

	fetch('/api/statistics/milestones').then(res => res.json()).then(ms => {
		milestones = ms;
	}).then(() => {
		updateMilestones(milestones);

		fetch('/api/conInfo').then(res => res.json()).then(con => {
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

					switch (data.type) {
						case 'milestoneUpdate':
							milestones[milestones.findIndex(ms => ms.id === data.milestone.id)] = data.milestone;
							// TODO trigger confetti or something on new reached milestone
							updateMilestones(data.milestone);
							break;
						case 'notification':
							if (data.notification) document.getElementById('notification').innerText = data.notification.text;
							util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
							break;
						default:
							break;
					}
				});
			});
		});
	});
});
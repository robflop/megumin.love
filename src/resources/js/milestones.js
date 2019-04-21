document.addEventListener('DOMContentLoaded', () => {
	const formatNumber = number => number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	const formatDate = date => {
		let month = date.getMonth() + 1;
		if (month < 10) month = `0${month}`;

		return `${date.getDate()}.${month}.${date.getFullYear()}`;
	};

	let milestones = [], sounds = [];

	function updateMilestones(ms) {
		const milestonesWrap = document.getElementById('milestones-wrap');
		milestonesWrap.innerHTML = ''; // Wipe before reload

		const milestonesList = document.createElement('ol');

		for (milestone of ms) {
			const milestoneListElement = document.createElement('li');
			milestoneListElement.classList.add('milestones');
			milestoneListElement.id = `milestone-${milestone.id}`;

			const milestoneHeader = document.createElement('h3');
			milestoneHeader.innerText = `Milestone ${milestone.id}`;

			milestoneListElement.appendChild(milestoneHeader);

			const milestoneCount = document.createElement('p');
			milestoneCount.innerText = `Clicks to reach: ${formatNumber(milestone.count)}`;

			milestoneListElement.appendChild(milestoneCount);

			const milestoneStatus = document.createElement('p');
			milestoneStatus.innerText = `Milestone reached: ${milestone.reached === 0 ? 'No' : 'Yes'}`;

			milestoneListElement.appendChild(milestoneStatus);

			if (milestone.reached) {
				const formattedDate = formatDate(new Date(milestone.timestamp));

				const milestoneDate = document.createElement('p');
				milestoneDate.innerText = `Count reached on: ${formattedDate}`;

				milestoneListElement.appendChild(milestoneDate);

				const milestoneSound = document.createElement('p');
				milestoneSound.innerText = `Sound that played: ${sounds.find(s => s.id === milestone.soundID).displayname || 'Unknown'}`;

				milestoneListElement.appendChild(milestoneSound);
			}

			milestonesList.appendChild(milestoneListElement);
		}

		milestonesWrap.appendChild(milestonesList);
	}

	fetch('/api/statistics/milestones').then(res => res.json()).then(ms => {
		milestones = ms;
	}).then(() => fetch('/api/sounds').then(res => res.json())).then(s => {
		sounds = s;
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
						case 'notification':
							if (data.notification) document.getElementById('notification').innerText = data.notification.text;
							util.fade(document.getElementById('notification-wrapper'), data.notification.duration * 1000, 0.1);
							break;
						case 'milestoneUpdate':
							milestones[milestones.findIndex(ms => ms.id === data.statistics.milestone.id)] = data.statistics.milestone;
							updateMilestones(milestones);
							break;
						case 'soundRename':
							sounds[sounds.findIndex(snd => snd.id === data.sound.id)] = data.sound;
							break;
						case 'soundUpload':
							sounds.push(data.sound);
							break;
						case 'soundDelete':
							sounds.splice(sounds.findIndex(snd => snd.id === data.sound.id), 1);
							break;
						default:
							break;
					}
				});
			});
		});
	});
});
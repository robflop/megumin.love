document.addEventListener('DOMContentLoaded', async () => {
	function formatNumber(number) {
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
	}

	function formatDate(date) {
		let month = date.getMonth() + 1;
		if (month < 10) month = `0${month}`;

		let day = date.getDate();
		if (day < 10) day = `0${day}`;

		return `${day}.${month}.${date.getFullYear()}`;
	}

	function updateMilestones(ms) {
		const milestonesWrap = document.getElementById('milestones-wrap');
		milestonesWrap.innerHTML = '';

		if (ms.length === 0) {
			const warning = document.createElement('h3');
			warning.id = 'warning';
			warning.innerText = 'No milestones available.';

			return milestonesWrap.appendChild(warning);
		}

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
				milestoneDate.innerText = `Count reached on: ${milestone.timestamp ? formattedDate : 'Unknown'}`;

				milestoneListElement.appendChild(milestoneDate);

				const milestoneSoundElement = document.createElement('p');
				const soundObject = sounds.find(s => s.id === milestone.soundID);
				milestoneSoundElement.innerText = `Sound that played: ${soundObject ? soundObject.displayname : 'Unknown'}`;

				milestoneListElement.appendChild(milestoneSoundElement);
			}

			milestonesList.appendChild(milestoneListElement);
		}

		milestonesWrap.appendChild(milestonesList);
	}

	const milestones = await fetch('/api/statistics/milestones').then(res => res.json());
	const sounds = await fetch('/api/sounds').then(res => res.json());
	updateMilestones(milestones);

	const conInfo = await fetch('/api/conInfo').then(res => res.json());

	const domainOrIP = document.URL.split('/')[2].split(':')[0];
	const host = conInfo.ssl ? `wss://${domainOrIP}` : `ws://${domainOrIP}:${conInfo.port}`;

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
				case 'milestoneModify':
					milestones[milestones.findIndex(ms => ms.id === data.milestone.id)] = data.milestone;
					updateMilestones(milestones);
					break;
				case 'milestoneAdd':
					milestones.push(data.milestone);
					updateMilestones(milestones);
					break;
				case 'milestoneDelete':
					milestones.splice(milestones.findIndex(ms => ms.id === data.milestone.id), 1);
					updateMilestones(milestones);
					break;
				case 'soundModify':
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
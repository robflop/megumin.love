document.addEventListener('DOMContentLoaded', async () => {
	function formatDate(date) {
		let month = date.getMonth() + 1;
		if (month < 10) month = `0${month}`;

		return `${date.getDate()}.${month}.${date.getFullYear()}`;
	}

	function updateSounds(s) {
		s.forEach(snd => {
			if (!snd.displayname) snd.displayname = '';
		});

		sounds = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons

		const options = sounds.map(sound => {
			const source = sound.source === 'no-source' ? 'No source' : `From ${sound.source}`;
			const theme = `associated with "${sound.theme}"`;
			return `
				<option value=${sound.id}>
					${sound.displayname} (${sound.filename}.mp3, ${source}, ${sound.count} clicks, ${theme})
				</option>
			`;
		});
		options.unshift('<option value="">No sound selected</option>');

		const uploadThemeOptions = themes.map(theme => `<option value=${theme.name}>Theme: ${theme.name}</option>`);
		const modifyThemeOptions = themes.map(theme => `<option value=${theme.name}>${theme.name}</option>`);
		modifyThemeOptions.unshift('<option value="megumin">Default theme</option>');
		modifyThemeOptions.unshift('<option value="">No theme change</option>');

		document.getElementById('sound-modify-id-select').innerHTML = options.join('');
		document.getElementById('sound-delete-id-select').innerHTML = options.join('');
		document.getElementById('milestone-add-sound_id-select').innerHTML = options.join('');
		document.getElementById('milestone-modify-sound_id-select').innerHTML = options.join('');

		document.getElementById('sound-upload-theme-select').innerHTML = uploadThemeOptions.join('');
		document.getElementById('sound-modify-theme-select').innerHTML = modifyThemeOptions.join('');
	}

	function updateMilestones(m) {
		milestones = m.sort((a, b) => a.id - b.id);

		const options = milestones.map(milestone => {
			const reachedString = milestone.reached ? 'Reached' : 'Not reached';
			const sound = sounds.find(snd => snd.id === milestone.sound_id);
			const formattedDate = milestone.timestamp ? formatDate(new Date(milestone.timestamp)) : 'No timestamp';
			return `
				<option value=${milestone.id}>
					Milestone ${milestone.id} (${milestone.count} clicks, ${reachedString}, ${formattedDate}, ${sound ? sound.filename : 'No sound'})
				</option>
			`;
		});

		options.unshift('<option value="">No milestone selected</option>');

		document.getElementById('milestone-modify-id-select').innerHTML = options.join('');
		document.getElementById('milestone-delete-id-select').innerHTML = options.join('');
	}

	let sounds = await fetch('/api/sounds').then(res => res.json());
	updateSounds(sounds);

	let milestones = await fetch('/api/statistics/milestones').then(res => res.json());
	updateMilestones(milestones);

	const config = await fetch('/api/admin/config').then(res => res.json());
	document.getElementById('update-interval-current').innerHTML = `Current: ${config.updateInterval}`;
	document.getElementById('response-interval-current').innerHTML = `Current: ${config.responseInterval} | -1 to immediately respond`;
	document.getElementById('socket-connections-current').innerHTML = `Current: ${config.socketConnections} | -1 to disable`;
	document.getElementById('rate-limit-current').innerHTML = `Current: ${config.requestsPerMinute} | -1 to disable`;

	const soundResponse = document.getElementById('sound-response');
	const milestoneResponse = document.getElementById('milestone-response');
	const configResponse = document.getElementById('config-response');

	/* ------ Sound-panel Forms ------ */

	const soundUploadForm = document.getElementById('sound-upload-form');
	soundUploadForm.addEventListener('submit', async e => {
		e.preventDefault();

		const formData = new FormData();

		for (let i = 0; i < soundUploadForm.elements.length - 1; i++) {
			const field = soundUploadForm.elements[i];
			if (field.name === 'file') {
				formData.append('file', field.files[0]);
				continue;
			}
			if (field.value !== '') formData.append(field.name, field.value);
		} // Minus one of its length to take out the submit button

		const uploadRes = await fetch('/api/admin/sounds/upload', {
			method: 'POST',
			headers: {
				Authorization: localStorage.getItem('token')
				// Content-Type not set because of boundary
			},
			body: formData
		}).then(res => res.json());

		if (uploadRes.code === 200) {
			soundUploadForm.reset();

			soundResponse.innerText = 'Sound successfully uploaded!';
			util.fade(soundResponse, 5000);

			sounds.push(uploadRes.sound);
			return updateSounds(sounds);
		}
		else {
			soundResponse.innerText = `An Error occurred (Code ${uploadRes.code}): ${uploadRes.message}`;
			return util.fade(soundResponse, 5000);
		}
	});

	const soundModifyForm = document.getElementById('sound-modify-form');
	soundModifyForm.addEventListener('submit', async e => {
		e.preventDefault();

		const data = {};

		for (let i = 0; i < soundModifyForm.elements.length - 1; i++) {
			const field = soundModifyForm.elements[i];
			if (field.value !== '') data[field.name] = field.value;
		} // Minus one of its length to take out the submit button

		const modifyRes = await fetch('/api/admin/sounds/modify', {
			method: 'PATCH',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(res => res.json());

		if (modifyRes.code === 200) {
			soundModifyForm.reset();

			soundResponse.innerText = 'Sound successfully modified!';
			util.fade(soundResponse, 5000);

			sounds[sounds.findIndex(snd => snd.id === modifyRes.sound.id)] = modifyRes.sound;
			// Compare IDs because all other fields may have changed, id the only constant
			return updateSounds(sounds);
		}
		else {
			soundResponse.innerText = `An Error occurred (Code ${modifyRes.code}): ${modifyRes.message}`;
			return util.fade(soundResponse, 5000);
		}
	});

	const soundDeleteForm = document.getElementById('sound-delete-form');
	soundDeleteForm.addEventListener('submit', async e => {
		e.preventDefault();

		const deleteRes = await fetch('/api/admin/sounds/delete', {
			method: 'DELETE',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: soundDeleteForm[0].value })
		}).then(res => res.json());

		if (deleteRes.code === 200) {
			soundDeleteForm.reset();

			soundResponse.innerText = 'Sound successfully deleted!';
			util.fade(soundResponse, 5000);

			sounds.splice(sounds.findIndex(snd => snd.id === deleteRes.sound.id), 1);
			// Compare IDs because all other fields may have changed, id the only constant
			return updateSounds(sounds);
		}
		else {
			soundResponse.innerText = `An Error occurred (Code ${deleteRes.code}): ${deleteRes.message}`;
			return util.fade(soundResponse, 5000);
		}
	});

	/* ------ Milestone-panel Forms ------ */

	const milestoneAddForm = document.getElementById('milestone-add-form');
	milestoneAddForm.addEventListener('submit', async e => {
		e.preventDefault();

		const data = {};

		for (let i = 0; i < milestoneAddForm.elements.length - 1; i++) {
			const field = milestoneAddForm.elements[i];
			if (field.value !== '') data[field.name] = field.value;
		} // Minus one of its length to take out the submit button

		const addRes = await fetch('/api/admin/milestones/add', {
			method: 'POST',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(res => res.json());

		if (addRes.code === 200) {
			milestoneAddForm.reset();

			milestoneResponse.innerText = 'Milestone successfully added!';
			util.fade(milestoneResponse, 5000);

			milestones.push(addRes.milestone);
			return updateMilestones(milestones);
		}
		else {
			milestoneResponse.innerText = `An Error occurred (Code ${addRes.code}): ${addRes.message}`;
			return util.fade(milestoneResponse, 5000);
		}
	});

	const milestoneModifyForm = document.getElementById('milestone-modify-form');
	milestoneModifyForm.addEventListener('submit', async e => {
		e.preventDefault();

		const data = {};

		for (let i = 0; i < milestoneModifyForm.elements.length - 1; i++) {
			const field = milestoneModifyForm.elements[i];
			if (field.value !== '') data[field.name] = field.value;
		} // Minus one of its length to take out the submit button

		const modifyRes = await fetch('/api/admin/milestones/modify', {
			method: 'PATCH',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(res => res.json());

		if (modifyRes.code === 200) {
			milestoneModifyForm.reset();

			milestoneResponse.innerText = 'Milestone successfully modified!';
			util.fade(milestoneResponse, 5000);

			milestones[milestones.findIndex(ms => ms.id === modifyRes.milestone.id)] = modifyRes.milestone;
			// Compare IDs because all other fields may have changed, id the only constant
			return updateMilestones(milestones);
		}
		else {
			milestoneResponse.innerText = `An Error occurred (Code ${modifyRes.code}): ${modifyRes.message}`;
			return util.fade(milestoneResponse, 5000);
		}
	});

	const milestoneDeleteForm = document.getElementById('milestone-delete-form');
	milestoneDeleteForm.addEventListener('submit', async e => {
		e.preventDefault();

		const deleteRes = await fetch('/api/admin/milestones/delete', {
			method: 'DELETE',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: milestoneDeleteForm[0].value })
		}).then(res => res.json());

		if (deleteRes.code === 200) {
			milestoneDeleteForm.reset();

			milestoneResponse.innerText = 'Milestone successfully deleted!';
			util.fade(milestoneResponse, 5000);

			milestones.splice(milestones.findIndex(ms => ms.id === deleteRes.milestone.id), 1);
			// Compare IDs because all other fields may have changed, id the only constant
			return updateMilestones(milestones);
		}
		else {
			milestoneResponse.innerText = `An Error occurred (Code ${deleteRes.code}): ${deleteRes.message}`;
			return util.fade(milestoneResponse, 5000);
		}
	});

	/* ------ Config-panel Forms ------ */

	const updateIntervalForm = document.getElementById('update-interval-form');
	updateIntervalForm.addEventListener('submit', async e => {
		e.preventDefault();

		const data = {};

		for (let i = 0; i < updateIntervalForm.elements.length - 1; i++) {
			const field = updateIntervalForm.elements[i];
			if (field.value !== '') data[field.name] = field.value;
		} // Minus one of its length to take out the submit button

		const intervalRes = await fetch('/api/admin/config/updateinterval', {
			method: 'PATCH',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(res => res.json());

		if (intervalRes.code === 200) {
			updateIntervalForm.reset();

			configResponse.innerText = 'Update interval successfully updated!';
			util.fade(configResponse, 5000);

			document.getElementById('update-interval-current').innerHTML = `Current: ${data.interval}`;
		}
		else {
			configResponse.innerText = `An Error occurred (Code ${intervalRes.code}): ${intervalRes.message}`;
			util.fade(configResponse, 5000);
		}
	});

	const responseIntervalForm = document.getElementById('response-interval-form');
	responseIntervalForm.addEventListener('submit', async e => {
		e.preventDefault();

		const data = {};

		for (let i = 0; i < responseIntervalForm.elements.length - 1; i++) {
			const field = responseIntervalForm.elements[i];
			if (field.value !== '') data[field.name] = field.value;
		} // Minus one of its length to take out the submit button

		const intervalRes = await fetch('/api/admin/config/responseinterval', {
			method: 'PATCH',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(res => res.json());

		if (intervalRes.code === 200) {
			responseIntervalForm.reset();

			configResponse.innerText = 'Response interval successfully updated!';
			util.fade(configResponse, 5000);

			document.getElementById('response-interval-current').innerHTML = `Current: ${data.interval} | -1 to immediately respond`;
		}
		else {
			configResponse.innerText = `An Error occurred (Code ${intervalRes.code}): ${intervalRes.message}`;
			util.fade(configResponse, 5000);
		}
	});

	const socketConnectionsForm = document.getElementById('socket-connections-form');
	socketConnectionsForm.addEventListener('submit', async e => {
		e.preventDefault();

		const data = {};

		for (let i = 0; i < socketConnectionsForm.elements.length - 1; i++) {
			const field = socketConnectionsForm.elements[i];
			if (field.value !== '') data[field.name] = field.value;
		} // Minus one of its length to take out the submit button

		const connectionsRes = await fetch('/api/admin/config/connections', {
			method: 'PATCH',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(res => res.json());

		if (connectionsRes.code === 200) {
			socketConnectionsForm.reset();

			configResponse.innerText = 'Connection limit successfully updated!';
			util.fade(configResponse, 5000);

			document.getElementById('socket-connections-current').innerHTML = `Current: ${data.connections} | -1 to disable`;
		}
		else {
			configResponse.innerText = `An Error occurred (Code ${connectionsRes.code}): ${connectionsRes.message}`;
			util.fade(configResponse, 5000);
		}
	});

	const rateLimitForm = document.getElementById('rate-limit-form');
	rateLimitForm.addEventListener('submit', async e => {
		e.preventDefault();

		const data = {};

		for (let i = 0; i < rateLimitForm.elements.length - 1; i++) {
			const field = rateLimitForm.elements[i];
			if (field.value !== '') data[field.name] = field.value;
		} // Minus one of its length to take out the submit button

		const ratelimitRes = await fetch('/api/admin/config/ratelimit', {
			method: 'PATCH',
			headers: {
				'Authorization': localStorage.getItem('token'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(res => res.json());

		if (ratelimitRes.code === 200) {
			rateLimitForm.reset();

			configResponse.innerText = 'Ratelimit successfully updated!';
			util.fade(configResponse, 5000);

			document.getElementById('rate-limit-current').innerHTML = `Current: ${data.ratelimit} | -1 to disable`;
		}
		else {
			configResponse.innerText = `An Error occurred (Code ${ratelimitRes.code}): ${ratelimitRes.message}`;
			util.fade(configResponse, 5000);
		}
	});

	/* ------ Logout ------ */

	document.getElementById('logout').addEventListener('click', async e => {
		e.preventDefault();

		const logoutRes = await fetch('/api/admin/logout', {
			method: 'GET',
			headers: {
				Authorization: localStorage.getItem('token'),
			}
		}).then(res => res.json());

		if (logoutRes.code === 200) return window.location = '/';
	});
});
document.addEventListener('DOMContentLoaded', async () => {
	function formatDate(date) {
		let month = date.getMonth() + 1;
		if (month < 10) month = `0${month}`;

		return `${date.getDate()}.${month}.${date.getFullYear()}`;
	}

	function updateSounds(s) {
		s.forEach(snd => {
			if (!snd.displayname) snd.displayname = '';
			if (!snd.source) snd.source = '';
		});

		sounds = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons

		const options = sounds.map(sound => {
			const source = sound.source ? `From ${sound.source}` : 'No source';
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

		document.getElementById('soundModify-id-select').innerHTML = options.join('');
		document.getElementById('soundDelete-id-select').innerHTML = options.join('');
		document.getElementById('milestoneAdd-soundID-select').innerHTML = options.join('');
		document.getElementById('milestoneModify-soundID-select').innerHTML = options.join('');

		document.getElementById('soundUpload-theme-select').innerHTML = uploadThemeOptions.join('');
		document.getElementById('soundModify-theme-select').innerHTML = modifyThemeOptions.join('');
	}

	function updateMilestones(m) {
		milestones = m.sort((a, b) => a.id - b.id);

		const options = milestones.map(milestone => {
			const reachedString = milestone.reached ? 'Reached' : 'Not reached';
			const sound = sounds.find(snd => snd.id === milestone.soundID);
			const formattedDate = milestone.timestamp ? formatDate(new Date(milestone.timestamp)) : 'No timestamp';
			return `
				<option value=${milestone.id}>
					Milestone ${milestone.id} (${milestone.count} clicks, ${reachedString}, ${formattedDate}, ${sound ? sound.filename : 'No soundID'})
				</option>
			`;
		});

		options.unshift('<option value="">No milestone selected</option>');

		document.getElementById('milestoneModify-id-select').innerHTML = options.join('');
		document.getElementById('milestoneDelete-id-select').innerHTML = options.join('');
	}

	let sounds = await fetch('/api/sounds').then(res => res.json());
	updateSounds(sounds);

	let milestones = await fetch('/api/statistics/milestones').then(res => res.json());
	updateMilestones(milestones);

	const soundResponse = document.getElementById('soundResponse');
	const milestoneResponse = document.getElementById('milestoneResponse');

	const soundUploadForm = document.getElementById('soundUpload-form');
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

	const soundModifyForm = document.getElementById('soundModify-form');
	document.getElementById('soundModify-form').addEventListener('submit', async e => {
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

	const soundDeleteForm = document.getElementById('soundDelete-form');
	document.getElementById('soundDelete-form').addEventListener('submit', async e => {
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

	const milestoneAddForm = document.getElementById('milestoneAdd-form');
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

	const milestoneModifyForm = document.getElementById('milestoneModify-form');
	document.getElementById('milestoneModify-form').addEventListener('submit', async e => {
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

	const milestoneDeleteForm = document.getElementById('milestoneDelete-form');
	document.getElementById('milestoneDelete-form').addEventListener('submit', async e => {
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

	document.getElementById('logout').addEventListener('click', async e => {
		e.preventDefault();

		const logoutRes = fetch('/api/admin/logout', {
			method: 'GET',
			headers: {
				Authorization: localStorage.getItem('token'),
			}
		}).then(res => res.json());

		if (logoutRes.code === 200) return window.location.href = '/';
	});
});
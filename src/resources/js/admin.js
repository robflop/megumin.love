document.addEventListener('DOMContentLoaded', () => {
	let sounds = [], milestones = [];

	const updateSounds = s => {
		s.forEach(snd => {
			if (!snd.displayname) snd.displayname = '';
			if (!snd.source) snd.source = '';
		});

		sounds = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons

		const options = sounds.map(sound => {
			return `
				<option value=${sound.id}>
					${sound.displayname} (${sound.filename}, ${sound.source}, ${sound.association})
				</option>
			`;
		});

		document.getElementById('soundModify-select').innerHTML = options.join('');
		document.getElementById('soundDelete-select').innerHTML = options.join('');
	};
	const updateMilestones = m => {
		milestones = m.sort((a, b) => a.id - b.id);

		const options = milestones.map(milestone => {
			const reachedString = milestone.reached ? 'Reached' : 'Not reached';
			return `
				<option value=${milestone.id}>
					Milestone ${milestone.id} (${milestone.count} clicks, ${reachedString}, ${milestone.timestamp}, ${milestone.soundID})
				</option>
			`;
		});

		document.getElementById('milestoneModify-select').innerHTML = options.join('');
		document.getElementById('milestoneDelete-select').innerHTML = options.join('');
	};

	fetch('/api/sounds').then(res => res.json()).then(s => {
		updateSounds(s);
	}).then(() => fetch('/api/statistics/milestones').then(res => res.json())).then(m => {
		milestones = m;
		updateMilestones(m);

		const soundResponse = document.getElementById('soundResponse');
		const milestoneResponse = document.getElementById('milestoneResponse');

		const soundUploadForm = document.getElementById('soundUpload-form');
		soundUploadForm.addEventListener('submit', e => {
			e.preventDefault();

			const data = {};

			for (let i = 0; i < soundUploadForm.elements.length - 1; i++) {
				const field = soundUploadForm.elements[i];
				if (field.value !== '') data[field.name] = field.value;
			} // Minus one of its length to take out the submit button

			fetch('/api/admin/sounds/upload', {
				method: 'POST',
				headers: {
					Authorization: localStorage.getItem('token')
					// Content-Type not set because of boundary
				},
				body: new FormData(data)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					soundUploadForm.reset();

					soundResponse.innerText = 'Sound successfully uploaded!';
					util.fade(soundResponse, 5000);

					sounds.push(res.sound);
					return updateSounds(sounds);
				}
				else {
					soundResponse.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(soundResponse, 5000);
				}
			});
		});

		const soundModifyForm = document.getElementById('soundModify-form');
		document.getElementById('soundModify-form').addEventListener('submit', e => {
			e.preventDefault();

			const data = {};

			for (let i = 0; i < soundModifyForm.elements.length - 1; i++) {
				const field = soundModifyForm.elements[i];
				if (field.value !== '') data[field.name] = field.value;
			} // Minus one of its length to take out the submit button

			fetch('/api/admin/sounds/modify', {
				method: 'PATCH',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					soundModifyForm.reset();

					soundResponse.innerText = 'Sound successfully modified!';
					util.fade(soundResponse, 5000);

					sounds[sounds.findIndex(snd => snd.id === res.sound.id)] = res.sound;
					// Compare IDs because all other fields may have changed, id the only constant
					return updateSounds(sounds);
				}
				else {
					soundResponse.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(soundResponse, 5000);
				}
			});
		});

		const soundDeleteForm = document.getElementById('soundDelete-form');
		document.getElementById('soundDelete-form').addEventListener('submit', e => {
			e.preventDefault();

			fetch('/api/admin/sounds/delete', {
				method: 'DELETE',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: soundDeleteForm[0].value })
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					soundDeleteForm.reset();

					soundResponse.innerText = 'Sound successfully deleted!';
					util.fade(soundResponse, 5000);

					sounds.splice(sounds.findIndex(snd => snd.id === res.sound.id), 1);
					// Compare IDs because all other fields may have changed, id the only constant
					return updateSounds(sounds);
				}
				else {
					soundResponse.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(soundResponse, 5000);
				}
			});
		});

		const milestoneAddForm = document.getElementById('milestoneAdd-form');
		milestoneAddForm.addEventListener('submit', e => {
			e.preventDefault();

			const data = {};

			for (let i = 0; i < milestoneAddForm.elements.length - 1; i++) {
				const field = milestoneAddForm.elements[i];
				if (field.value !== '') data[field.name] = field.value;
			} // Minus one of its length to take out the submit button

			fetch('/api/admin/milestones/add', {
				method: 'POST',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					milestoneAddForm.reset();

					milestoneResponse.innerText = 'Milestone successfully added!';
					util.fade(milestoneResponse, 5000);

					milestones.push(res.milestone);
					return updateMilestones(milestones);
				}
				else {
					milestoneResponse.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(milestoneResponse, 5000);
				}
			});
		});

		const milestoneModifyForm = document.getElementById('milestoneModify-form');
		document.getElementById('milestoneModify-form').addEventListener('submit', e => {
			e.preventDefault();

			const data = {};

			for (let i = 0; i < milestoneModifyForm.elements.length - 1; i++) {
				const field = milestoneModifyForm.elements[i];
				if (field.value !== '') data[field.name] = field.value;
			} // Minus one of its length to take out the submit button

			fetch('/api/admin/milestones/modify', {
				method: 'PATCH',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					milestoneModifyForm.reset();

					milestoneResponse.innerText = 'Milestone successfully modified!';
					util.fade(milestoneResponse, 5000);

					milestones[milestones.findIndex(ms => ms.id === res.milestone.id)] = res.milestone;
					// Compare IDs because all other fields may have changed, id the only constant
					return updateMilestones(milestones);
				}
				else {
					milestoneResponse.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(milestoneResponse, 5000);
				}
			});
	});

		const milestoneDeleteForm = document.getElementById('milestoneDelete-form');
		document.getElementById('milestoneDelete-form').addEventListener('submit', e => {
			e.preventDefault();

			fetch('/api/admin/milestones/delete', {
				method: 'DELETE',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: milestoneDeleteForm[0].value })
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					milestoneDeleteForm.reset();

					milestoneResponse.innerText = 'Milestone successfully deleted!';
					util.fade(milestoneResponse, 5000);

					milestones.splice(milestones.findIndex(ms => ms.id === res.milestone.id), 1);
					// Compare IDs because all other fields may have changed, id the only constant
					return updateMilestones(milestones);
				}
				else {
					milestoneResponse.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(milestoneResponse, 5000);
				}
			});
		});
	});

	document.getElementById('logout').addEventListener('click', e => {
		e.preventDefault();

		fetch('/api/admin/logout', {
			method: 'GET',
			headers: {
				Authorization: localStorage.getItem('token'),
			}
		}).then(res => res.json()).then(res => {
			if (res.code === 200) return window.location.href = '/';
		});
	});
});
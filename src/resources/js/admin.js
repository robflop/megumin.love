document.addEventListener('DOMContentLoaded', () => {
	let sounds = [];
	// TODO: Test all of this again and make milestone frontend

	const updateSounds = s => {
		sounds = s.sort((a, b) => {
			if (!a.displayname || !b.displayname || !a.source || !b.source) return true;
			if (a.source === b.source) return a.displayname.localeCompare(b.displayname);
			else return a.source.localeCompare(b.source);
		});
		// Sort primarily by season and secondarily alphabetically within seasons
		const options = sounds.map(sound => {
			return `<option value=${sound.id}>${sound.displayname} (${sound.filename}, ${sound.source}, ${sound.association})</option>`;
		});

		document.getElementById('modify-select').innerHTML = options.join('');
		document.getElementById('delete-select').innerHTML = options.join('');
	};

	fetch('/api/sounds').then(res => res.json()).then(s => {
		updateSounds(s);
	}).then(() => {
		const response = document.getElementById('response');

		const uploadForm = document.getElementById('upload-form');
		uploadForm.addEventListener('submit', e => {
			e.preventDefault();

			fetch('/api/admin/sounds/upload', {
				method: 'POST',
				headers: {
					Authorization: localStorage.getItem('token')
					// Content-Type not set because of boundary
				},
				body: new FormData(uploadForm)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					uploadForm.reset();

					response.innerText = 'Sound successfully uploaded!';
					util.fade(response, 5000);

					sounds.push(res.sound);
					return updateSounds(sounds);
				}
				else {
					response.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(response, 5000);
				}
			});
		});

		const modifyForm = document.getElementById('modify-form');
		document.getElementById('modify-form').addEventListener('submit', e => {
			e.preventDefault();

			const data = {
				id: modifyForm[0].value,
				filename: modifyForm[1].value,
				displayname: modifyForm[2].value,
				source: modifyForm[3].value,
				count: modifyForm[4].value,
				association: modifyForm[5].value
			};

			fetch('/api/admin/sounds/modify', {
				method: 'PATCH',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					modifyForm.reset();

					response.innerText = 'Sound successfully modified!';
					util.fade(response, 5000);

					sounds[sounds.findIndex(snd => snd.id === res.sound.id)] = res.sound;
					// Compare IDs because all other fields may have changed, id the only constant
					return updateSounds(sounds);
				}
				else {
					response.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(response, 5000);
				}
			});
		});

		const deleteForm = document.getElementById('delete-form');
		document.getElementById('delete-form').addEventListener('submit', e => {
			e.preventDefault();

			fetch('/api/admin/sounds/delete', {
				method: 'DELETE',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: deleteForm[0].value })
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					deleteForm.reset();

					response.innerText = 'Sound successfully deleted!';
					util.fade(response, 5000);

					sounds.splice(sounds.findIndex(snd => snd.id === res.sound.id), 1);
					// Compare IDs because all other fields may have changed, id the only constant
					return updateSounds(sounds);
				}
				else {
					response.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(response, 5000);
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
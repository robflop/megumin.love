document.addEventListener('DOMContentLoaded', () => {
	let sounds = [];

	const updateSounds = s => {
		sounds = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons
		const options = sounds.map(sound => `<option value=${sound.filename}>${sound.displayname} (${sound.filename}, ${sound.source})</option>`);

		document.getElementById('rename-select').innerHTML = options.join('');
		document.getElementById('delete-select').innerHTML = options.join('');
	};

	fetch('/api/sounds').then(res => res.json()).then(s => {
		updateSounds(s);
	}).then(() => {
		const uploadForm = document.getElementById('upload-form');
		const uploadRes = document.getElementById('upload-res');
		uploadForm.addEventListener('submit', e => {
			e.preventDefault();

			const formData = new FormData(uploadForm);

			fetch('/api/admin/upload', {
				method: 'POST',
				headers: {
					Authorization: localStorage.getItem('token')
					// Content-Type not set because of boundary
				},
				body: formData
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					uploadForm.reset();

					uploadRes.innerText = 'Sound successfully uploaded!';
					util.fade(uploadRes, 5000);

					sounds.push(res.sound);
					return updateSounds(sounds);
				}
				else {
					uploadRes.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(uploadRes, 5000);
				}
			});
		});

		const renameForm = document.getElementById('rename-form');
		const renameRes = document.getElementById('rename-res');
		document.getElementById('rename-form').addEventListener('submit', e => {
			e.preventDefault();

			const data = {
				oldFilename: renameForm[0].value,
				newFilename: renameForm[1].value,
				newDisplayname: renameForm[2].value,
				newSource: renameForm[3].value
			};

			fetch('/api/admin/rename', {
				method: 'POST',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					renameForm.reset();

					renameRes.innerText = 'Sound successfully renamed!';
					util.fade(renameRes, 5000);

					sounds[sounds.findIndex(snd => snd.id === res.sound.id)] = res.sound;
					// Compare IDs because all other fields may have changed, id the only constant
					return updateSounds(sounds);
				}
				else {
					renameRes.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(renameRes, 5000);
				}
			});
		});

		const deleteForm = document.getElementById('delete-form');
		const deleteRes = document.getElementById('delete-res');
		document.getElementById('delete-form').addEventListener('submit', e => {
			e.preventDefault();

			const data = {
				filename: deleteForm[0].value
			};

			fetch('/api/admin/delete', {
				method: 'POST',
				headers: {
					'Authorization': localStorage.getItem('token'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(res => res.json()).then(res => {
				if (res.code === 200) {
					deleteForm.reset();

					deleteRes.innerText = 'Sound successfully deleted!';
					util.fade(deleteRes, 5000);

					sounds.splice(sounds.findIndex(snd => snd.id === res.sound.id), 1);
					// Compare IDs because all other fields may have changed, id the only constant
					return updateSounds(sounds);
				}
				else {
					deleteRes.innerText = `An Error occurred (Code ${res.code}): ${res.message}`;
					return util.fade(deleteRes, 5000);
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
$(document).ready(() => {
	let sounds = [];

	const updateSounds = s => {
		sounds = s.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
		// Sort primarily by season and secondarily alphabetically within seasons
		const options = sounds.map(sound => `<option value=${sound.filename}>${sound.displayname} (${sound.filename}, ${sound.source})</option>`);

		$('#rename-select').html(options.join(''));
		$('#delete-select').html(options.join(''));
	};

	$.get('/api/sounds').done(s => {
		updateSounds(s);
	}).then(() => {
		$('#upload-form').submit(e => {
			e.preventDefault();

			const textData = $('#upload-form').serializeArray();
			const fileData = $('#files')[0].files;
			const formData = new FormData();

			formData.append('filename', textData[0].value);
			formData.append('displayname', textData[1].value);
			formData.append('source', textData[2].value);
			formData.append('files[]', fileData[0]);
			formData.append('files[]', fileData[1]);

			$.ajax({
				async: true,
				url: '/api/admin/upload',
				method: 'POST',
				processData: false,
				contentType: false,
				mimeType: 'multipart/form-data',
				data: formData
			}).done(res => {
				res = JSON.parse(res); // No clue why it doesn't parse the reponse
				if (res.code === 200) {
					$('#upload-form').trigger('reset');
					$('#upload-res').text('Sound successfully uploaded!').fadeIn().fadeOut(5000);
					sounds.push(res.sound);

					return updateSounds(sounds);
				}
				else {
					return $('#upload-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
				}
			});
		});

		$('#rename-form').submit(e => {
			e.preventDefault();

			const data = $('#rename-form').serializeArray();

			$.post('/api/admin/rename', {
				oldFilename: data[0].value,
				newFilename: data[1].value,
				newDisplayname: data[2].value,
				newSource: data[3].value
			}).done(res => {
				if (res.code === 200) {
					$('#rename-form').trigger('reset');
					$('#rename-res').text('Sound successfully renamed!').fadeIn().fadeOut(5000);
					sounds[sounds.findIndex(snd => snd.id === res.sound.id)] = res.sound;
					// Compare IDs because all other fields may have changed, id the only constant

					return updateSounds(sounds);
				}
				else {
					return $('#rename-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
				}
			});
		});

		$('#delete-form').submit(e => {
			e.preventDefault();

			const data = $('#delete-form').serializeArray();

			$.post('/api/admin/delete', { filename: data[0].value }).done(res => {
				if (res.code === 200) {
					$('#delete-form').trigger('reset');
					$('#delete-res').text('Sound successfully deleted!').fadeIn().fadeOut(5000);
					sounds.splice(sounds.findIndex(snd => snd.id === res.sound.id), 1);
					// Compare IDs because all other fields may have changed, id the only constant

					return updateSounds(sounds);
				}
				else {
					return $('#delete-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
				}
			});
		});
	});

	$('#logout').click(e => {
		e.preventDefault();

		$.get('/api/admin/logout').done(res => {
			if (res.code === 200) return window.location.href = '/';
		});
	});
});
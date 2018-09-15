$(document).ready(() => {
	const updateSounds = () => {
		$.get('/api/sounds').done(sounds => {
			sounds = sounds.sort((a, b) => a.source === b.source ? a.displayname.localeCompare(b.displayname) : a.source.localeCompare(b.source));
			// Sort primarily by season and secondarily alphabetically within seasons
			const options = sounds.map(sound => `<option value=${sound.filename}>${sound.displayname} (${sound.filename}, ${sound.source})</option>`);

			$('#rename-select').html(options.join(''));
			$('#delete-select').html(options.join(''));
		});
	};

	updateSounds();

	$('#logout').click(e => {
		e.preventDefault();

		$.get('/api/logout').done(res => {
			if (res.code === 200) return window.location.href = '/';
		});
	});

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
			url: 'http://localhost:5959/api/upload',
			method: 'POST',
			processData: false,
			contentType: false,
			mimeType: 'multipart/form-data',
			data: formData
		}).done(res => {
			res = JSON.parse(res); // IDK why it sends a string
			if (res.code === 200) {
				$('#upload-form').trigger('reset');

				setTimeout(() => {
					$('#upload-res').text('Sound successfully uploaded!').fadeIn().fadeOut(5000);
					return updateSounds();
				}, 1000 * 0.5);
				// Use a timeout to give server necessary time to update data
			}
			else {
				return $('#upload-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
			}
		});
	});

	$('#rename-form').submit(e => {
		e.preventDefault();

		const data = $('#rename-form').serializeArray();

		$.post('/api/rename', {
			oldSoundName: data[0].value,
			newFilename: data[1].value,
			newDisplayname: data[2].value,
			newSource: data[3].value
		}).done(res => {
			if (res.code === 200) {
				$('#rename-form').trigger('reset');

				setTimeout(() => {
					$('#rename-res').text('Sound successfully renamed!').fadeIn().fadeOut(5000);
					return updateSounds();
				}, 1000 * 0.5);
				// Use a timeout to give server necessary time to update data
			}
			else {
				return $('#rename-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
			}
		});
	});

	$('#delete-form').submit(e => {
		e.preventDefault();

		const data = $('#delete-form').serializeArray();

		$.post('/api/delete', { sound: data[0].value }).done(res => {
			if (res.code === 200) {
				$('#delete-form').trigger('reset');

				setTimeout(() => {
					$('#delete-res').text('Sound successfully deleted!').fadeIn().fadeOut(5000);
					return updateSounds();
				}, 1000 * 0.5);
				// Use a timeout to give server necessary time to update data
			}
			else {
				return $('#delete-res').text(`An Error occurred (Code ${res.code}): ${res.message}`).fadeIn().fadeOut(5000);
			}
		});
	});
});
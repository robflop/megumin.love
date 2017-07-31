$(document).ready(() => {
	const howlerList = {};

	$('#name').click(() => {
		const rsound = Math.floor(Math.random() * 100) + 1;
		rsound === 42 ? howlerList.realname.play() : howlerList.name.play();
	});

	// Create buttons and make them play corresponding sounds
	for (const sound of sounds) {
		const season = $(`div.buttons-wrap.season${sound.season.replace(/\s/g, '-')}`);

		howlerList[sound.filename] = new Howl({
			src: [`/sounds/${sound.filename}.mp3`, `/sounds/${sound.filename}.ogg`, `/sounds/${sound.filename}.aac`]
		});

		if (sound.filename === 'realname') continue;
		// don't create button for this one
		if (season.length) {
			season.append(`<button id=${sound.filename}>${sound.displayName}</button>`);
		}
		else {
			$('#container').append('<br><br>');
			$('#container').append(`<div class="titles">Season ${sound.season}:</div>`);
			$(`<div class="buttons-wrap season${sound.season.replace(/\s/g, '-')}">`)
				.appendTo('#container')
				.append(`<button id=${sound.filename}>${sound.displayName}</button>`);
			// use appendTo to get reference to newly-created wrapper in return value which is then appended to
		}
		if (sound.filename === 'name') continue;
		// create button but don't use standard click function
		$(`#${sound.filename}`).click(() => howlerList[sound.filename].play());
	}
});
$(document).ready(function() { // eslint-disable-line
	const howlerList = {};

	$('#name').click(() => {
		const rsound = Math.floor(Math.random() * 100) + 1;
		switch (rsound) {
			case 42:
				howlerList.realname.play();
				break;
			default:
				howlerList.name.play();
				break;
		}
	});

	// Make button clicks play corresponding sounds
	for (let i = sounds.length - 1; i >= 0; i--) {
		howlerList[sounds[i]] = new Howl({ src: [`/sounds/${sounds[i]}.mp3`, `/sounds/${sounds[i]}.ogg`, `/sounds/${sounds[i]}.aac`] });
		if (sounds[i] === 'name') continue;
		$(`#${sounds[i]}`).click(function() { // eslint-disable-line func-names
			howlerList[$(this).attr('id')].play();
		});
	}
});
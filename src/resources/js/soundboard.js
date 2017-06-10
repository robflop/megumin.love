$(document).ready(function() { // eslint-disable-line
	const howlerList = {};

	$('#name').click(() => {
		const rsound = Math.floor(Math.random() * 100) + 1;
		rsound === 42 ? howlerList.realname.play() : howlerList.name.play();
	});

	// Make button clicks play corresponding sounds
	for (const sound of sounds) {
		howlerList[sound] = new Howl({ src: [`/sounds/${sound}.mp3`, `/sounds/${sound}.ogg`, `/sounds/${sound}.aac`] });
		if (sound === 'name') continue;
		$(`#${sound}`).click(() => howlerList[sound].play());
	}
});
document.addEventListener('DOMContentLoaded', () => {
	/* Backgrounds */

	let backgroundSetting = localStorage.getItem('background');
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8'];
	const seasonalBackgrounds = [
		{ filename: 'bg1_independence', displayName: 'Independence Day', month: 7 },
		{ filename: 'bg1_christmas', displayName: 'Christmas', month: 12 },
		// { filename: 'bg1_halloween', displayName: 'Halloween', month: 9 },
		// { filename: 'bg1_easter', displayName: 'Easter', month: 4 },
		// { filename: 'bg1_birthday', displayName: 'Birthday', month: 1} // No canon confirmation of the month, January is speculation
	];
	const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	const bodyElem = document.getElementsByTagName('body')[0];
	const bgSelect = document.getElementById('bg-select');

	if (!backgroundSetting) {
		const fittingSeasonalBackground = seasonalBackgrounds.find(sBg => sBg.month === new Date().getMonth() + 1);
		if (fittingSeasonalBackground) backgroundSetting = fittingSeasonalBackground.filename;
		else backgroundSetting = 'random';
	}

	bodyElem.style.backgroundImage = `url(/images/backgrounds/${backgroundSetting === 'random' ? randomBg : backgroundSetting}.jpg)`;

	bgSelect.addEventListener('change', function() {
		/* eslint-disable no-invalid-this */
		if (this.value !== 'random') bodyElem.style.backgroundImage = `url(/images/backgrounds/${this.value}.jpg)`;
		return localStorage.setItem('background', this.value);
		/* eslint-enable no-invalid-this */
	});

	let bgOptions = backgrounds.map(bg => `<option value=${bg}>Background ${bg.substr(2)}</option>`);
	bgOptions = bgOptions.concat(seasonalBackgrounds.map(seasonal => `<option value=${seasonal.filename}>${seasonal.displayName}</option>`));
	bgOptions.unshift('<option value="random">Randomize (on F5)</option>');

	bgSelect.innerHTML = bgOptions.join('');
	bgSelect.value = backgroundSetting;

	/* Crazy mode */

	const crazyModeToggle = document.getElementById('crazymode-toggle');
	let crazyMode = localStorage.getItem('crazyMode');

	crazyModeToggle.checked = crazyMode;
	crazyModeToggle.addEventListener('change', function() {
		/* eslint-disable no-invalid-this */
		if (!this.checked) localStorage.removeItem('crazyMode');
		else localStorage.setItem('crazyMode', true);

		return crazyMode = this.checked;
		/* eslint-enable no-invalid-this */
	});

	/* Util funcs */

	const util = {};

	util.fade = function(elem, duration = 2000, step = 0.1) {
		elem.style.display = 'block';
		elem.style.opacity = 0;
		let fadedIn = false;
		let delayOver = false;

		const fadeInterval = setInterval(() => {
			if (elem.style.opacity === '1') {
				fadedIn = true; // So it doesn't increase opacity beyond 1
				if (!delayOver) setTimeout(() => delayOver = true, duration);
			}
			if (elem.style.opacity < 1 && !fadedIn) elem.style.opacity = parseFloat(elem.style.opacity) + step;

			if (elem.style.opacity > 0 && delayOver) elem.style.opacity = parseFloat(elem.style.opacity) - step;
			if (elem.style.opacity === '0') {
				elem.style.display = 'none';
				clearInterval(fadeInterval);
			}
		}, 100);
	};

	window.util = util;
});
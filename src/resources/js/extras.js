document.addEventListener('DOMContentLoaded', () => {
	/* Backgrounds */

	const currentYear = new Date().getFullYear();

	let backgroundSetting = localStorage.getItem('background');
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8'];
	const seasonalBackgrounds = [ // All months are 0-indexed! E.g. 11 is December
		{ filename: 'bg1_independence', displayName: 'Independence Day', start: new Date(currentYear, 6, 10), end: new Date(currentYear, 6, 16) },
		{ filename: 'bg1_christmas', displayName: 'Christmas', start: new Date(currentYear, 11, 15), end: new Date(currentYear, 11, 27) },
		{ filename: 'bg1_halloween', displayName: 'Halloween', start: new Date(currentYear, 9, 24), end: new Date(currentYear, 10, 3) },
		{ filename: 'bg1_easter', displayName: 'Easter', start: new Date(currentYear, 3, 15), end: new Date(currentYear, 3, 28) },
		// { filename: 'bg1_birthday', displayName: 'Birthday', start: new Date(currentYear, 0, 15), end: new Date(currentYear, 0, 28) }
		// No canon confirmation of the birthday month, January is speculation
	];
	const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	let preferSeasonals = localStorage.getItem('preferSeasonals');

	const bodyElem = document.getElementsByTagName('body')[0];
	const bgSelect = document.getElementById('bg-select');
	const preferSeasonalsToggle = document.getElementById('prefer-seasonals-toggle');

	if (!backgroundSetting || preferSeasonals) {
		const currentDate = new Date();

		const fittingSeasonalBackground = seasonalBackgrounds.find(sBg => currentDate >= sBg.start && currentDate <= sBg.end);
		if (fittingSeasonalBackground) backgroundSetting = fittingSeasonalBackground.filename;
		else if (!backgroundSetting) backgroundSetting = 'randomBg'; // Only applies when there is no preference & no seasonal
	}

	if (backgroundSetting !== 'randomBg') bodyElem.classList.add(backgroundSetting);
	else bodyElem.classList.add(randomBg);

	let currentBg = backgroundSetting === 'randomBg' ? randomBg : backgroundSetting;

	bgSelect.addEventListener('change', e => {
		if (e.target.value === 'reset') {
			return localStorage.removeItem('background');
		}
		if (e.target.value !== 'randomBg') {
			bodyElem.classList.remove(currentBg);
			bodyElem.classList.add(e.target.value);

			currentBg = e.target.value;
		}
		return localStorage.setItem('background', e.target.value);
	});

	let bgOptions = backgrounds.map(bg => `<option value=${bg}>Background ${bg.substr(2)}</option>`);
	bgOptions = bgOptions.concat(seasonalBackgrounds.map(seasonal => `<option value=${seasonal.filename}>${seasonal.displayName}</option>`));
	bgOptions.unshift('<option value="randomBg">Random (Default)</option>');
	bgOptions.unshift('<option value="reset">Reset Preference</option>');

	bgSelect.innerHTML = bgOptions.join('');
	bgSelect.value = backgroundSetting;

	preferSeasonalsToggle.checked = preferSeasonals;
	preferSeasonalsToggle.addEventListener('change', e => {
		if (e.target.checked) localStorage.setItem('preferSeasonals', true);
		else localStorage.removeItem('preferSeasonals');

		return preferSeasonals = e.target.checked;
	});

	/* Crazy mode */

	const crazyModeToggle = document.getElementById('crazymode-toggle');
	let crazyMode = localStorage.getItem('crazyMode');

	crazyModeToggle.checked = crazyMode;
	crazyModeToggle.addEventListener('change', e => {
		if (e.target.checked) localStorage.setItem('crazyMode', true);
		else localStorage.removeItem('crazyMode');

		return crazyMode = e.target.checked;
	});

	/* Util funcs */

	const util = {};

	util.fade = function(elem, displayDuration = 2000, step = 0.1) {
		elem.style.display = 'block';
		elem.style.opacity = 0;
		let fadedIn = false;
		let delayOver = false;

		const fadeInterval = setInterval(() => {
			if (elem.style.opacity === '1') {
				fadedIn = true; // So it doesn't increase opacity infinitely beyond 1
				if (!delayOver) setTimeout(() => delayOver = true, displayDuration);
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
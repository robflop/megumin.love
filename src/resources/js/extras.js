document.addEventListener('DOMContentLoaded', () => {
	/* Backgrounds */

	const currentDate = new Date();
	const setDate = (month, day, yearOffset = 0) => {
		const year = currentDate.getFullYear() + yearOffset;
		return new Date(year, month, day);
	};

	let backgroundSetting = localStorage.getItem('background');
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8', 'bg9'];
	const seasonalBackgrounds = [ // All months are 0-indexed! E.g. 0 is January, 11 is December
		{ filename: 'bg1_easter', displayName: 'Easter', start: setDate(3, 15), end: setDate(3, 28), versions: 2 },
		{ filename: 'bg1_usa_independence', displayName: 'USA Independence', start: setDate(6, 13), end: setDate(6, 15), versions: 1 },
		{ filename: 'bg1_german_unity', displayName: 'German Unity Day', start: setDate(9, 2), end: setDate(9, 4), versions: 1 },
		{ filename: 'bg1_halloween', displayName: 'Halloween', start: setDate(9, 24), end: setDate(10, 3), versions: 2 },
		// { filename: 'bg1_birthday', displayName: 'Birthday', start: setDate(11, 3), end: setDate(11, 5), versions: 1 } // Canon B-day is 4th Dec
		{ filename: 'bg1_christmas', displayName: 'Christmas', start: setDate(11, 15), end: setDate(11, 27), versions: 1 },
		{ filename: 'bg1_newyearseve', displayName: 'New Year\'s Eve', start: setDate(11, 30), end: setDate(0, 1, 1), versions: 1 },
	];
	const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	let preferSeasonals = localStorage.getItem('preferSeasonals');

	const bodyElem = document.body;
	const bgSelect = document.getElementById('bg-select');
	const preferSeasonalsToggle = document.getElementById('prefer-seasonals-toggle');

	if (!backgroundSetting || preferSeasonals) {
		const fittingSeasonalBackground = seasonalBackgrounds.find(sBg => currentDate >= sBg.start && currentDate <= sBg.end);
		if (fittingSeasonalBackground) {
			if (fittingSeasonalBackground.versions > 1) {
				backgroundSetting = `${fittingSeasonalBackground.filename}${Math.ceil(Math.random() * fittingSeasonalBackground.versions)}`;
				// Ceil used instead of floor so that it never ends on 0, but always between 1 and the version amount
			}
			else backgroundSetting = fittingSeasonalBackground.filename;
		}
		else if (!backgroundSetting) backgroundSetting = 'randomBg'; // Only applies when there is no preference & no seasonal
	}

	bodyElem.classList.add(backgroundSetting !== 'randomBg' ? backgroundSetting : randomBg);

	let currentBg = backgroundSetting === 'randomBg' ? randomBg : backgroundSetting;

	bgSelect.addEventListener('change', e => {
		const { value } = e.target;

		if (value === 'reset') {
			return localStorage.removeItem('background');
		}
		if (value !== 'randomBg') {
			bodyElem.classList.remove(currentBg);
			bodyElem.classList.add(value);

			currentBg = value;
		}
		return localStorage.setItem('background', value);
	});

	const bgOptions = backgrounds.map(bg => `<option value="${bg}">Background ${bg.substr(2)}</option>`);
	const seasonalBgOptions = seasonalBackgrounds.map(seasonal => {
		if (seasonal.versions > 1) {
			let seasonalVersions = '';
			for (let i = 1; i <= seasonal.versions; i++) {
				seasonalVersions += `<option value="${seasonal.filename}${i}">${seasonal.displayName} (${i})</option>`;
			}

			return seasonalVersions;
		}
		else return `<option value="${seasonal.filename}">${seasonal.displayName}</option>`;
	});
	bgOptions.push(seasonalBgOptions);
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
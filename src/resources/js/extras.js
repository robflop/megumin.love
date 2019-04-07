document.addEventListener('DOMContentLoaded', () => {
	/* Backgrounds */

	const originalTitle = document.title;
	const currentDate = new Date(); currentDate.setHours(0, 0, 0, 0); // Breaks when hours not set to midnight
	const setDate = (month, day) => {
		const year = currentDate.getFullYear();
		return new Date(year, month - 1, day);
	};
	const setSpecialEffects = specialBg => {
		const existingSpecialCSS = document.getElementById('special-css');
		if (existingSpecialCSS) document.head.removeChild(existingSpecialCSS);

		const specialBackground = specialBackgrounds.find(s => s.filename === specialBg);
		const specialCSS = document.createElement('link');
		specialCSS.rel = 'stylesheet';
		specialCSS.href = `/css/${specialBackground.css}.min.css`;
		specialCSS.id = 'special-css';

		document.head.appendChild(specialCSS);

		document.getElementById('hangumin').src = `/images/general/${specialBackground.svg}.svg`;
		document.title = originalTitle.replace('Megumin', specialBackground.title);
	};

	let backgroundSetting = localStorage.getItem('background');
	const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8', 'bg9'];
	const seasonalBackgrounds = [
		{ filename: 'bg1_easter', displayName: 'Easter', start: setDate(4, 14), end: setDate(4, 28), versions: 2 },
		{ filename: 'bg1_usa_independence', displayName: 'USA Independence', start: setDate(7, 14), end: setDate(7, 14), versions: 1 },
		{ filename: 'bg1_german_unity', displayName: 'German Unity Day', start: setDate(10, 3), end: setDate(10, 3), versions: 1 },
		{ filename: 'bg1_halloween', displayName: 'Halloween', start: setDate(10, 26), end: setDate(11, 2), versions: 2 },
		{ filename: 'bg1_birthday', displayName: 'Birthday', start: setDate(12, 4), end: setDate(12, 4), versions: 1 }, // Canon B-day is 4th Dec
		{ filename: 'bg1_christmas', displayName: 'Christmas', start: setDate(12, 19), end: setDate(12, 26), versions: 1 },
		{ filename: 'bg1_newyearseve', displayName: 'New Year\'s Eve', start: setDate(12, 31), end: setDate(1, 1), versions: 1 },
	];
	const specialBackgrounds = [
		{ filename: 'special_true_goddess', displayName: 'True Goddess', css: 'true_goddess', svg: 'Bluegumin', title: 'Aqua' },
		{ filename: 'special_chivalrous_crusader', displayName: 'Chivalrous Crusader', css: 'chivalrous_crusader', svg: 'Yellowgumin', title: 'Darkness' },
		{ filename: 'special_equality_advocate', displayName: 'Equality Advocate', css: 'equality_advocate', svg: 'Greengumin', title: 'Kazuma' }
	];
	const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

	let preferSeasonals = localStorage.getItem('preferSeasonals');
	const bodyElem = document.body;
	const bgSelect = document.getElementById('bg-select');
	const preferSeasonalsToggle = document.getElementById('prefer-seasonals-toggle');

	if (!backgroundSetting || preferSeasonals) {
		const fittingSeasonalBackground = seasonalBackgrounds.find(sBg => {
			let fitting = currentDate >= sBg.start && currentDate <= sBg.end;

			if (sBg.start.getMonth() > sBg.end.getMonth()) { // Event goes from one year into the next
				fitting = currentDate >= sBg.start || currentDate <= sBg.end;
				/*
				This OR works because if the start month is after the end month, then for it to trigger
				the current date has to be either after or in the start (so for new year's december)
				OR before or in the end (so for new year's january)

				It's not AND because it can't be both after/in December AND before/in January at the same time
				*/
			}

			return fitting;
		});

		if (fittingSeasonalBackground) {
			if (fittingSeasonalBackground.versions > 1) {
				backgroundSetting = `${fittingSeasonalBackground.filename}${Math.ceil(Math.random() * fittingSeasonalBackground.versions)}`;
				// Ceil used instead of floor so that it never ends on 0, but always between 1 and the version amount
			}
			else backgroundSetting = fittingSeasonalBackground.filename;
		}
		else if (!backgroundSetting) backgroundSetting = 'randomBg'; // Only applies when there is no preference & no seasonal currently active
	}

	bodyElem.classList.add(backgroundSetting !== 'randomBg' ? backgroundSetting : randomBg);
	if (specialBackgrounds.map(s => s = s.filename).includes(backgroundSetting)) setSpecialEffects(backgroundSetting);

	let currentBg = backgroundSetting === 'randomBg' ? randomBg : backgroundSetting;

	bgSelect.addEventListener('change', e => {
		const { value } = e.target;

		if (value === 'reset') {
			if (document.getElementById('special-css')) document.head.removeChild(document.getElementById('special-css'));
			if (!document.title.includes('Megumin')) document.title = originalTitle;
			if (!document.getElementById('hangumin').src.includes('Hangumin')) {
				document.getElementById('hangumin').src = '/images/general/Hangumin.svg';
			}

			bodyElem.classList.remove(currentBg);
			bodyElem.classList.add('bg1'); // Reset to default bg
			return localStorage.removeItem('background');
		}
		if (value !== 'randomBg') {
			if (specialBackgrounds.map(s => s = s.filename).includes(value)) setSpecialEffects(value);
			else { // Making sure there are no special background settings left when switching to non-special backgrounds
				if (document.getElementById('special-css')) document.head.removeChild(document.getElementById('special-css'));
				if (!document.title.includes('Megumin')) document.title = originalTitle;
				if (!document.getElementById('hangumin').src.includes('Hangumin')) {
					document.getElementById('hangumin').src = '/images/general/Hangumin.svg';
				}
			}

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
	const specialBgOptions = specialBackgrounds.map(special => `<option value="${special.filename}">${special.displayName}</option>`);

	bgOptions.push(seasonalBgOptions);
	bgOptions.push(specialBgOptions);
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
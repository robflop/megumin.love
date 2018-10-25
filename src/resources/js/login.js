document.addEventListener('DOMContentLoaded', () => {
	document.getElementsByTagName('form')[0].addEventListener('submit', e => {
		const token = e.target[0].value;

		fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				token
			})
		}).then(res => res.json())
			.then(res => {
				if (res.code === 200) {
					localStorage.setItem('token', token);
					return window.location.href = '/admin';
				}
				else {
					const loginRes = document.getElementById('login-res');

					loginRes.innerText = `Errorcode ${res.code}: ${res.message}`;
					util.fade(loginRes, 2000, 0.1);
				}
			});
		// No catch because it doesn't reject on http error, so all is handled in promise resolve

		e.preventDefault();
	});
});
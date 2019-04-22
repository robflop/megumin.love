document.addEventListener('DOMContentLoaded', async () => {
	document.getElementsByTagName('form')[0].addEventListener('submit', async e => {
		const token = e.target[0].value;

		const authRes = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token })
		}).then(res => res.json());

		if (authRes.code === 200) {
			localStorage.setItem('token', token);
			return window.location.href = '/admin';
		}
		else {
			const loginRes = document.getElementById('login-res');

			loginRes.innerText = `Error ${authRes.code}: ${authRes.message}`;
			util.fade(loginRes, 2000, 0.1);
		}

		e.preventDefault();
	});
});
$(document).ready(() => {
	$('#login').submit(e => {
		const token = $('#login').serializeArray()[0].value;

		$.post('/api/login', { token }).done(res => {
			if (res.code === 200) {
				localStorage.setItem('token', token);
				return window.location.href = '/admin';
			}
		}).fail(res => {
			return $('#login-res').text(`Errorcode ${res.responseJSON.code}: ${res.responseJSON.message}`).fadeIn().fadeOut(2000);
		});
		e.preventDefault();
	});
});
//Nothing in here happens until the webpage is completely loaded
$(document).ready(function() {
	jQuery.fn.center = function () {
		this.css('position','absolute');
		this.css('top', Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + 'px');
		this.css('left', Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + 'px');
		return this;
	}
	$('#box').center();
	$('#box').fadeIn(250);
	console.log('fug');
	ion.sound({
		sounds: [{
			name: "yamero"
		}],
		path: "./",
		preload: true,
		multiplay: true,
	});
	$('#button').click(function() {
		$.ajax({
			method: 'GET',
			url: 'includes/update_counter.php',
			data: { count : '1' }
		}).done(function(res) {
			ion.sound.play("yamero");
			$('#counter').html(res);
		});
	});
	
});
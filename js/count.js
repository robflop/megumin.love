$(document).ready(function () {
    jQuery.fn.center = function () {
        this.css('position', 'absolute');
        this.css('top', Math.max(0, (($(window).height() - $(this).outerHeight()) / 1.5) + $(window).scrollTop()) + 'px');
        this.css('left', Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + 'px');
        return this;
    }
    $('#box').center();
    $('#box').fadeIn(250);
    console.log("No stealing code! ;) -- Check out the Github Repo at https://git.io/vrrEi instead.");
    ion.sound({
        sounds: [{
            name: "yamero"
		}],
        path: "./",
        preload: true,
        multiplay: true,
    });
    $('#button').click(function () {
        ion.sound.play("yamero");
        $.ajax({
            method: 'GET',
            url: 'includes/cache_counter.php',
            data: {
                count: '1'
            }
        }).done(function (res) {
            $('#counter').html(res);
        });
    });

});
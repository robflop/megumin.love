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
        sounds: [
            {name: "yamero"},
            {name: "pull"},
            {name: "explosion"},
            {name: "itai"},
            {name: "name"},
        ],
        path: "sounds/",
        preload: true,
        multiplay: true,
    });
    $('#button').click(function () {
        var rsound = Math.floor(Math.random() * 5);
        switch(rsound) {
            case 0:
                ion.sound.play("yamero");
                break;
            case 1:
                ion.sound.play("pull");
                break;
            case 2:
                ion.sound.play("explosion");
                break;
            case 3:
                ion.sound.play("itai");
                break;
            case 4:
                ion.sound.play("name");
                break;
        }
        var curr =
            $('#counter').html(parseInt($('#counter').html()) + 1);
        $.ajax({
            method: 'GET',
            url: 'includes/cache_counter.php',
            data: {
                count: '1'
            }
        }).done(function (res) {});
    });

});
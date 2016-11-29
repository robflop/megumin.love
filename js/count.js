$(document).ready(function () {
    jQuery.fn.center = function () { // Function to center elements
        this.css('position', 'absolute');
        this.css('top', Math.max(0, (($(window).height() - $(this).outerHeight()) / 1.5) + $(window).scrollTop()) + 'px');
        this.css('left', Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + 'px');
        return this;
    };
    $('#box').center();
    $('#box').fadeIn(250);
    console.log("No stealing code! ;) -- Check out the Github Repo at https://git.io/vrrEi instead.");
    ion.sound({ // Initialize all sounds with options
        sounds: [
            {name: "yamero"},
            {name: "pull"},
            {name: "explosion"},
            {name: "itai"},
            {name: "name"},
            {name: "eugh1"},
            {name: "eugh2"},
            {name: "eugh3"},
            {name: "eugh4"},
            {name: "n"},
            {name: "sion"},
            {name: "plosion"},
        ],
        path: "sounds/",
        preload: true,
        multiplay: true,
    });
    $('#button').click(function () { // Randomize sound that is played on buttonclick
        var rsound = Math.floor(Math.random() * 12) + 1;
        switch(rsound) {
            case 1:
                ion.sound.play("yamero");
                break;
            case 2:
                ion.sound.play("pull");
                break;
            case 3:
                ion.sound.play("explosion");
                break;
            case 4:
                ion.sound.play("itai");
                break;
            case 5:
                ion.sound.play("name");
                break;
            case 6:
                ion.sound.play("eugh1");
                break;
            case 7:
                ion.sound.play("eugh2");
                break;
            case 8: 
                ion.sound.play("eugh3");
                break;
            case 9:
                ion.sound.play("eugh4");
                break;
            case 10:
                ion.sound.play("n");
                break;
            case 11:
                ion.sound.play("plosion");
                break;
            case 12:
                ion.sound.play("sion");
                break;
        };
		// Increase counter client-side
        $('#counter').html(parseInt($('#counter').html()) + 1);
        $.ajax({ // Send GET-request to increase counter server-side
            method: 'GET',
            url: 'includes/cache_counter.php',
            data: {
                count: '1'
            }
        }).done(function (res) {});
    }); // Re-center box on orientation change
    $(window).on("orientationchange", function() {
        $('#box').center();
    }); 
});
$(document).ready(function () { 
    jQuery.fn.center = function () { // Function to center elements
        this.css('position', 'absolute');
        this.css('top', Math.max(0, (($(window).height() - $(this).outerHeight()) / 1.5) + $(window).scrollTop()) + 'px');
        this.css('left', Math.max(0, (($(window).width() - $(this).outerWidth()) / 2.2) + $(window).scrollLeft()) + 'px');
        return this;
    };
    $('#container').center();  
    $('#container').fadeIn(250);
    console.log("No stealing code! ;) -- Check out the Github Repo at https://git.io/vrrEi instead.");
    ion.sound({  // Initialize all sounds with options
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
            {name: "plosion"},
            {name: "sion"},
            {name: "n"},
			{name: "realname",preload:false},
			{name: "magic-item"},
			{name: "parents"},
			{name: "hyoizaburo"},
			{name: "oi"},
			{name: "igiari"},
			{name: "hmph"}
        ],
        path: "sounds/",
        preload: true,
        multiplay: true,
    });
	// Make button clicks play corresponding sounds
	$('#yamero').click(function () {
		ion.sound.play("yamero");
	});
	$('#pull').click(function () {
		ion.sound.play("pull");
	});
	$('#explosion').click(function () {
		ion.sound.play("explosion");
	});
	$('#itai').click(function () {
		ion.sound.play("itai");
	});
	$('#name').click(function () {
		var rsound = Math.floor(Math.random() * 100) + 1;
		switch(rsound){
			case 42:
				ion.sound.play("realname")
				break;
			default:
				ion.sound.play("name")
				break;
		}
	});
	$('#eugh1').click(function () {
		ion.sound.play("eugh1");
	});
	$('#eugh2').click(function () {
		ion.sound.play("eugh2");
	});
	$('#eugh3').click(function () {
		ion.sound.play("eugh3");
	});
	$('#eugh4').click(function () {
		ion.sound.play("eugh4");
	});
	$('#plosion').click(function () {
		ion.sound.play("plosion");
	});
	$('#sion').click(function () {
		ion.sound.play("sion");
	});
	$('#n').click(function () {
		ion.sound.play("n");
	});
	$('#parents').click(function () {
		ion.sound.play("parents");
	});
	$('#hyoizaburo').click(function () {
		ion.sound.play("hyoizaburo");
	});
	$('#oi').click(function () {
		ion.sound.play("oi");
	});
	$('#magic-item').click(function () {
		ion.sound.play("magic-item");
	});
	$('#igiari').click(function () {
		ion.sound.play("igiari");
	});
	$('#hmph').click(function () {
		ion.sound.play("hmph");
	});
});
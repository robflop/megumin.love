$(document).ready(function () { 
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
            {name: "n"},
			{name: "realname",preload:false},
            {name: "sion"},
            {name: "plosion"},
			{name: "magic-item"},
			{name: "parents"},
			{name: "hyoizaburo"},
			{name: "star"},
			{name: "oi"},
			{name: "igiari"},
			{name: "hmph"},
            {name: "zuryah"},
            {name: "whatsthis"},
            {name: "who"},
            {name: "yes"},
            {name: "yoroshii"},
            {name: "tropes"},
            {name: "truepower"},
            {name: "waah"},
            {name: "wellthanks"},
            {name: "oh"},
            {name: "shouganai"},
            {name: "sigh"},
            {name: "splat"},
            {name: "itscold"},
            {name: "ladiesfirst"},
            {name: "mywin"},
            {name: "nani"},
            {name: "dontwanna"},
            {name: "doushimashou"},
            {name: "friends"},
            {name: "hau"},
            {name: "isee"},
            {name: "bighug"},
            {name: "chomusuke"},
            {name: "comeatme"},
            {name: "dododo"},
            {name: "are"},
            {name: "aughh"},
			{name: "chomusukefaint"},
            {name: "ripchomusuke"},
            {name: "explosion2"},
            {name: "losion"},
            {name: "sion2"},
            {name: "n2"},
            {name: "hua"},
            {name: "thinking"},
			{name: "lalala"}
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
	$('#star').click(function () {
		ion.sound.play("star");
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
	$('#zuryah').click(function () {
		ion.sound.play("zuryah");
	});
	$('#whatsthis').click(function () {
		ion.sound.play("whatsthis");
	});
	$('#who').click(function () {
		ion.sound.play("who");
	});
	$('#yes').click(function () {
		ion.sound.play("yes");
	});
	$('#yoroshii').click(function () {
		ion.sound.play("yoroshii");
	});
	$('#tropes').click(function () {
		ion.sound.play("tropes");
	});
	$('#truepower').click(function () {
		ion.sound.play("truepower");
	});
	$('#waah').click(function () {
		ion.sound.play("waah");
	});
	$('#wellthanks').click(function () {
		ion.sound.play("wellthanks");
	});
	$('#oh').click(function () {
		ion.sound.play("oh");
	});
	$('#shouganai').click(function () {
		ion.sound.play("shouganai");
	});
	$('#sigh').click(function () {
		ion.sound.play("sigh");
	});
	$('#splat').click(function () {
		ion.sound.play("splat");
	});
	$('#itscold').click(function () {
		ion.sound.play("itscold");
	});
	$('#ladiesfirst').click(function () {
		ion.sound.play("ladiesfirst");
	});
	$('#mywin').click(function () {
		ion.sound.play("mywin");
	});
	$('#nani').click(function () {
		ion.sound.play("nani");
	});
	$('#dontwanna').click(function () {
		ion.sound.play("dontwanna");
	});
	$('#doushimashou').click(function () {
		ion.sound.play("doushimashou");
	});
	$('#friends').click(function () {
		ion.sound.play("friends");
	});
	$('#hau').click(function () {
		ion.sound.play("hau");
	});
	$('#isee').click(function () {
		ion.sound.play("isee");
	});
	$('#bighug').click(function () {
		ion.sound.play("bighug");
	});
	$('#chomusuke').click(function () {
		ion.sound.play("chomusuke");
	});
	$('#comeatme').click(function () {
		ion.sound.play("comeatme");
	});
	$('#dododo').click(function () {
		ion.sound.play("dododo");
	});
	$('#are').click(function () {
		ion.sound.play("are");
	});
	$('#aughh').click(function () {
		ion.sound.play("aughh");
	});
	$('#chomusukefaint').click(function () {
		ion.sound.play("chomusukefaint");
	});
	$('#ripchomusuke').click(function () {
		ion.sound.play("ripchomusuke");
	});
	$('#explosion2').click(function () {
		ion.sound.play("explosion2");
	});
	$('#losion').click(function () {
		ion.sound.play("losion");
	});
	$('#sion2').click(function () {
		ion.sound.play("sion2");
	});
	$('#n2').click(function () {
		ion.sound.play("n2");
	});
	$('#hua').click(function () {
		ion.sound.play("hua");
	});
	$('#thinking').click(function () {
		ion.sound.play("thinking");
	});
	$('#lalala').click(function () {
		ion.sound.play("lalala");
	});
});
$(document).ready(function(){
    function getKey(dom){
	return dom.parents(".lamp-ul").find(".key").val();
    }

    function setColor(dom, x, y, bri){
	dom.find("input[name=x]").val(x);
	dom.find("input[name=y]").val(y);
	dom.find("input[name=bri]").val(bri);
    }
    
    function numberChange(dom){
	var checked = dom.parents(".lamp-ul").find(".group").prop("checked");
	if(checked){
	    var lamp_ul = dom.parents(".lamp-ul");
	    var key = lamp_ul.find(".key").val();
	    var x = lamp_ul.find("input[name=x]").val();
	    var y = lamp_ul.find("input[name=y]").val();
	    var bri = lamp_ul.find("input[name=bri]").val();
	    
	    var lamps = $("#lamp-form").children(".lamp");

	    lamps.each(function(){
		if($(this).find(".group").prop("checked")){
		    setColor($(this), x, y, bri);
		}
	    });
	}
    }

    function submitColor(){
	lamps = $("#lamp-form").children(".lamp");
	lamps.each(function(){
	    var key = $(this).find(".key").val();
	    var x = parseFloat($(this).find("input[name=x]").val());
	    var y = parseFloat($(this).find("input[name=y]").val());
	    var bri = parseFloat($(this).find("input[name=bri]").val());
	    
	    var data = {
		"xy": [x, y],
		"bri": bri
	    };
	    
	    $.ajax({
		url: "http://" + ip + "/api/" + user + "/lights/" + key + "/state",
		type: "PUT",
		dataType: 'JSON',
		data: JSON.stringify(data),
		success: function( data ) {
		    if(debug){
			for(var i=0; i < data.length; i++){
			    one_data = data[i];
			    if(one_data["error"]){
				alert(JSON.stringify(one_data["error"]));
			    }
			}
		    }
		},
	    });

	});

    }

    $('.number').change(function() {
	numberChange($(this));
    });

    // submit when enter pushed
    $('.number').keypress(function(e) {
	var value = $(this).val();
	if (e.keyCode == 13 && value != "") {
	    numberChange($(this));
	    submitColor();
	}
    });
    // submit when submit button pushed
    $("#submit-button").click(submitColor);
    
    
    // on off button
    function setOnOff(key, on){
	var data = {on: on};
	var button = $("#lamp-form").find(".key[value=" + key + "]").parents(".lamp-ul").find(".on-off-button");

	$.ajax({
	    url: "http://" + ip + "/api/" + user + "/lights/" + key + "/state",
	    type: "PUT",
            dataType: 'JSON',
	    data: JSON.stringify(data),
	    success: function( data ) {
		var new_state;
		for(key in data[0]["success"]){
		    new_state = data[0]["success"][key];
		}
		if(new_state){
		    button.val("on");
		}else{
		    button.val("off");
		}
	    }
	});
    }
    
    $(".on-off-button").click(function(){
	var key = getKey($(this));
	//set new state
	var state;
	if($(this).val() == "on"){
	    state = false;
	}else{
	    state = true;
	}
	setOnOff(key, state);
    });
    
    //presets button
    $(".preset").click(function(){
	var colors = presets[$(this).val()];

	for(var i=0; i<colors.length; i++){
	    var key = i + 1;
	    color = colors[i];
	    setOnOff(key, color["on"]);
	    var lamp_ul = $("#lamp-form").find(".key[value=" + key + "]").parents(".lamp-ul");
	    setColor(lamp_ul, color["x"], color["y"], color["hue"]);
	}
	submitColor();
    });

    //init
    var ip = "192.168.0.147";
    var user = "newdeveloper";
    var debug = false;
    
    //presets
    var hue = 80;
    var presets = {
	"aaaa":
	[{
	    on: true,
	    x: 0.1,
	    y: 0.2,
	    hue: hue
	},
	 {
	     on: true,
	     x: 0.2,
	     y: 0.3,
	     hue: hue
	 },
	 {
	     on: true,
	     x: 0.4,
	     y: 0.4,
	     hue: hue
	 },
	 {
	     on: true,
	     x: 0.6,
	     y: 0.7,
	     hue: hue
	 },
	 {
	     on: true,
	     x: 0.8,
	     y: 0.6,
	     hue: hue
	 }
	],
	"bbb":
	[{
	    on: true,
	    x: 11,
	    y: 22,
	    hue: 11
	}],

    };

    for( var key in presets){
	var preset = presets[key];
	var newpreset = $( "#origin-preset" ).clone(true);
	newpreset.val(key);
	newpreset.show().removeAttr("id").insertBefore( $("#origin-preset") );
    };
    
    //get lights
    $.ajax({
	url: "http://" + ip + "/api/" + user + "/lights",
	type: "GET",
	success: function( data ) {
	    for( var key in data){
		//clone lamp form
		var newlamp = $( "#origin-lamp" ).clone(true);

		// set on or off
		if(data[key]["state"]["on"]){
		    newlamp.find(".on-off-button").val("on");
		}else{
		    newlamp.find(".on-off-button").val("off");
		}
		// set x y bri
		var bri = data[key]["state"]["bri"];
		var xy = data[key]["state"]["xy"];
		var x = xy[0];
		var y = xy[1];
		newlamp.find("input[name=x]").val(x);
		newlamp.find("input[name=y]").val(y);
		newlamp.find("input[name=bri]").val(bri);

		newlamp.find(".key").val(key);
		newlamp.find(".name").text(data[key]["name"]);
		newlamp.show().removeAttr("id").addClass("lamp").insertBefore( $("#origin-lamp") );
	    }
	}
    });
});
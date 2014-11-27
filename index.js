$(document).ready(function(){
    function getKey(dom){
	return dom.parents(".lamp-ul").find(".key").val();
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
		    $(this).find("input[name=x]").val(x);
		    $(this).find("input[name=y]").val(y);
		    $(this).find("input[name=bri]").val(bri);
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
		}
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
	alert($(this).val());
	var colors = presets[$(this).val()];
	alert(JSON.stringify(colors));
	for(var i=0; i<colors.length; i++){
	    var key = i + 1;
	    color = colors[i];
	    //alert(color["on"]);
	    setOnOff(key, color["on"]);
	}
    });

    //init
    var ip = "192.168.0.147";
    var user = "newdeveloper";
    
    presets = {
	"aaaa":
	[{
	    on: true,
	    x: 11,
	    y: 22,
	    hue: 11
	},
	 {
	     on: false,
	     x: 11,
	     y: 22,
	     hue: 11
	}],
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
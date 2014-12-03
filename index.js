$(document).ready(function(){
    function range(start, end){
	var array = [];
	for(var i = start; i <= end; i++){
	    array.push(i);
	}
	return array;
    }

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

	var checked = $(this).parents(".lamp-ul").find(".group").prop("checked");
	if(checked){
	    var lamps = $("#lamp-form").children(".lamp");

	    lamps.each(function(){
		if($(this).find(".group").prop("checked")){
		    setOnOff($(this).find(".key").val(), state);
		}
	    });
	}else{
	    setOnOff(key, state);
	}
    });
    
    //presets button
    $(".preset").click(function(){
	var colors = controls[$("#control-key").text()]["buttons"][$(this).val()];
	var lamps = $("#lamp-form").children(".lamp");

	lamps.each(function(i){
	    if( i < colors.length){
		var color = colors[i];
		var key = $(this).find(".key").val();
		setOnOff(key, color["on"]);
		setColor($(this).find(".lamp-ul"), color["x"], color["y"], color["bri"]);
		i = i + 1;
	    }
	});
	submitColor();
    });

    function initLights(lights_array){
	//get lights
	$.ajax({
	    url: "http://" + ip + "/api/" + user + "/lights",
	    type: "GET",
	    success: function( data ) {
		//remove old class
		$(".lamp").remove();

		for( var key in data){
		    if( $.inArray(parseInt(key), lights_array) == -1){
			continue;
		    }
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
    }

    function initButtons(buttons_array){
	$(".preset-instance").remove();
	for( var key in buttons_array){
	    var preset = buttons_array[key];
	    var newpreset = $( "#origin-preset" ).clone(true);
	    newpreset.val(key);
	    newpreset.show().removeAttr("id").addClass("preset-instance").insertBefore( $("#origin-preset") );
	};
    }

    function initControlButtons(control){
	for( var key in control){
	    var newcontrol = $( "#origin-control" ).clone(true);
	    newcontrol.val(key);
	    newcontrol.show().removeAttr("id").addClass("control-instance").insertBefore( $("#origin-control") );
	}
    }

    $(".control").click(function(){
	initControl($(this).val());
    });

    function initControl(control_name){
	$("#control-key").text(control_name);
	initLights(controls[control_name]["lights"]);
	initButtons(controls[control_name]["buttons"]);
    }

    //init
    var ip = "192.168.0.147";
    var user = "newdeveloper";
    var debug = false;

    
    //presets
    //var max = 255;
    //var X = 0.346;
    //var Y = 0.358;

	//ﾃﾞｨﾌｭｰｽﾞ無し
    var D11 = {	on: true,
	x: 0.346,
	y: 0.358,
	bri: 124
    };
	var D12 = {	on: true,
	x: 0.346,
	y: 0.358,
	bri: 148
    };
	var D13 = {	on: true,
	x: 0.345,
	y: 0.356,
	bri: 197
    };
	
	
    var D21 = {	on: true,
	x: 0.346,
	y: 0.358,
	bri: 112
    };
    var D22 = {	on: true,
	x: 0.346,
	y: 0.356,
	bri: 134
    };
    var D23 = {	on: true,
	x: 0.345,
	y: 0.356,
	bri: 180
    };
	
	var D31 = {	on: true,
	x: 0.346,
	y: 0.358,
	bri: 84
    };
	var D32 = {	on: true,
	x: 0.346,
	y: 0.357,
	bri: 103
    };
	var D33 = {	on: true,
	x: 0.345,
	y: 0.356,
	bri: 142
    };
	
	
	//ﾃﾞｨﾌｭｰｽ有り
    var d11 = {	on: true,
	x: 0.347,
	y: 0.360,
	bri: 154
    };
	var d12 = {	on: true,
	x: 0.347,
	y: 0.359,
	bri: 185
    };
	var d13 = {	on: true,
	x: 0.346,
	y: 0.357,
	bri: 255
    };
	
	
    var d21 = {	on: true,
	x: 0.347,
	y: 0.360,
	bri: 140
    };
    var d22 = {	on: true,
	x: 0.347,
	y: 0.359,
	bri: 169
    };
    var d23 = {	on: true,
	x: 0.346,
	y: 0.357,
	bri: 230
    };
	
	var d31 = {	on: true,
	x: 0.347,
	y: 0.36,
	bri: 108
    };
	var d32 = {	on: true,
	x: 0.347,
	y: 0.359,
	bri: 132
    };
	var d33 = {	on: true,
	x: 0.346,
	y: 0.357,
	bri: 183
    };
	
	//OFF
    var off = {	on: false,
	x: 0.346,
	y: 0.358,
	bri: 0
    };

    var presets = {
	"all OFF":
	[
	    off,off,off,off,off
	],
	
	//no difはﾃﾞｨﾌｭｰｽﾞ無しの意味，大・大は（仰角，照度）＝（大，大）
	"no dif 大・大":
	[
	    D11,D11,D11,D11,D11
	],
	"no dif 中・大":
	[
	    D12,D12,D12,D12,D12
	],
	"no dif 小・大":
	[
	    D13,D13,D13,D13,D13
	],
	
	
	"no dif 大・中":
	[
	    D21,D21,D21,D21,D21
	],
	"no dif 中・中":
	[
	    D22,D22,D22,D22,D22
	],
	"no dif 小・中":
	[
	    D23,D23,D23,D23,D23
	],

	
	"no dif 大・小":
	[
	    D31,D31,D31,D31,D31
	],
	"no dif 中・小":
	[
	    D32,D32,D32,D32,D32
	],
	"no dif 小・小":
	[
	    D33,D33,D33,D33,D33
	],
	
	

		//difはﾃﾞｨﾌｭｰｽﾞ有りの意味，大・大は（仰角，照度）＝（大，大）
	"dif 大・大":
	[
	    d11,d11,d11,d11,d11
	],
	"dif 中・大":
	[
	    d12,d12,d12,d12,d12
	],
	"dif 小・大":
	[
	    d13,d13,d13,d13,d13
	],
	
	
	"dif 大・中":
	[
	    d21,d21,d21,d21,d21
	],
	"dif 中・中":
	[
	    d22,d22,d22,d22,d22
	],
	"dif 小・中":
	[
	    d23,d23,d23,d23,d23
	],

	
	"dif 大・小":
	[
	    d31,d31,d31,d31,d31
	],
	"dif 中・小":
	[
	    d32,d32,d32,d32,d32
	],
	"dif 小・小":
	[
	    d33,d33,d33,d33,d33
	],
}
	

    var presets_b = presets;


    //control numbers
    var controls = {
	"all": {
	    "lights": range(1,15),
	    "buttons": presets
	},
	"1": {
	    "lights": range(1,5),
	    "buttons": presets_b
	},
	"2": {
	    "lights": range(6,10),
	    "buttons": presets_b
	},
	"3": {
	    "lights": range(11,15),
	    "buttons": presets_b
	}
    }

    initControlButtons(controls);
    initControl("all");
});
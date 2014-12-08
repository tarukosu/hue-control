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
		    button.val("ON");
		}else{
		    button.val("OFF");
		}
	    }
	});
    }
    
    $(".on-off-button").click(function(){
	var key = getKey($(this));
	//set new state
	var state;
	if($(this).val() == "ON"){
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
			newlamp.find(".on-off-button").val("ON");
		    }else{
			newlamp.find(".on-off-button").val("OFF");
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
	    newpreset.html(key);
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
	$(".control.btn-success").removeClass("btn-success");
	$(".control[value=" + control_name + "]").addClass("btn-success");
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

	var f = {	on: true,
	x: 0.344,
	y: 0.358,
	bri: 186
    };
	
	
	//ﾃﾞｨﾌｭｰｽﾞ無し
    var D11 = {	on: true,
	x: 0.3465,
	y: 0.359,
	bri: 240
    };
	var D12 = {	on: true,
	x: 0.347,
	y: 0.359,
	bri: 175
    };
/*	var D13 = {	on: true,
	x: 0.345,
	y: 0.356,
	bri: 197
    };
	*/
	
    var D21 = {	on: true,
	x: 0.346,
	y: 0.359,
	bri: 193
    };
    var D22 = {	on: true,
	x: 0.346,
	y: 0.358,
	bri: 138
    };
/*    var D23 = {	on: true,
	x: 0.345,
	y: 0.356,
	bri: 180
    };
*/	
	var D31 = {	on: true,
	x: 0.346,
	y: 0.3585,
	bri: 217
    };
	var D32 = {	on: true,
	x: 0.3455,
	y: 0.358,
	bri: 157
    };
/*	var D33 = {	on: true,
	x: 0.345,
	y: 0.356,
	bri: 142
    };
*/	
	
	//ﾃﾞｨﾌｭｰｽ有り
    var d11 = {	on: true,
	x: 0.3475,
	y: 0.3605,
	bri: 240
    };
	var d12 = {	on: true,
	x: 0.347,
	y: 0.360,
	bri: 175
    };
/*	var d13 = {	on: true,
	x: 0.346,
	y: 0.357,
	bri: 255
    };
*/	
	
    var d21 = {	on: true,
	x: 0.347,
	y: 0.360,
	bri: 138
    };
    var d22 = {	on: true,
	x: 0.348,
	y: 0.361,
	bri: 217
    };
/*    var d23 = {	on: true,
	x: 0.346,
	y: 0.357,
	bri: 230
    };
*/	
	var d31 = {	on: true,
	x: 0.348,
	y: 0.361,
	bri: 217
    };
	var d32 = {	on: true,
	x: 0.347,
	y: 0.3605,
	bri: 157
    };
/*	var d33 = {	on: true,
	x: 0.346,
	y: 0.357,
	bri: 183
    };
*/
	
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
 
	
	//no difはﾃﾞｨﾌｭｰｽﾞ無しの意味
	"dif<br/>仰角大・照度大":
	[
	    D11,D11,D11,D11,D11
	],
	"dif<br/>仰角大・照度小":
	[
	    D12,D12,D12,D12,D12
	],
/*	"仰角大・照度大":
	[
	    D13,D13,D13,D13,D13
	],
*/	
	
	"dif<br/>仰角中・照度大":
	[
	    D21,D21,D21,D21,D21
	],
	"dif<br/>仰角中・照度小":
	[
	    D22,D22,D22,D22,D22
	],
/*	"仰角大・照度大":
	[
	    D23,D23,D23,D23,D23
	],
*/
	
	"dif<br/>仰角小・照度大":
	[
	    D31,D31,D31,D31,D31
	],
	"dif<br/>仰角小・照度小":
	[
	    D32,D32,D32,D32,D32
	],
/*	"仰角大・照度大":
	[
	    D33,D33,D33,D33,D33
	],
*/	
	
	
	"FRONT":
	[
	    f,f,f,f,f
	],
	
	
	//difはﾃﾞｨﾌｭｰｽﾞ有りの意味
	"no dif<br/>仰角大・照度大":
	[
	    d11,d11,d11,d11,d11
	],
	"no dif<br/>仰角大・照度小":
	[
	    d12,d12,d12,d12,d12
	],
/*	"dif 小・大":
	[
	    d13,d13,d13,d13,d13
	],
*/	
	
	"no dif<br/>仰角中・照度大":
	[
	    d21,d21,d21,d21,d21
	],
	"no dif<br/>仰角中・照度小":
	[
	    d22,d22,d22,d22,d22
	],
/*	"dif 小・中":
	[
	    d23,d23,d23,d23,d23
	],
*/	

	"no dif<br/>仰角小・照度大":
	[
	    d31,d31,d31,d31,d31
	],
	"no dif<br/>仰角小・照度小":
	[
	    d32,d32,d32,d32,d32
	],
/*	"dif 小・小":
	[
	    d33,d33,d33,d33,d33
	],
*/
}
	

    var presets_b = presets;


    //control numbers
    var controls = {
	"all": {
	    "lights": range(1,15),
	    "buttons": presets
	},
	"サイド": {
	    "lights": range(1,5),
	    "buttons": presets_b
	},
	"フロント": {
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
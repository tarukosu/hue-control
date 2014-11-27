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

    $(".on-off-button").click(function(){
	//set new state
	var state;
	if($(this).val() == "on"){
	    state = false;
	}else{
	    state = true;
	}
	data = {on: state};

	var key = getKey($(this));
	var button = $(this);

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
		if(state){
		    button.val("on");
		}else{
		    button.val("off");
		}
	    }
	});
    });

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
    $("#submit-button").click(submitColor);

    //init
    var ip = "192.168.0.147"
    var user = "newdeveloper"
    
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
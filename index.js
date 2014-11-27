$(document).ready(function(){
    function getKey(dom){
	return dom.parents(".lamp-ul").find(".key").val();
    }
    
    /*
    $(".number").change(function(){
	alert("aa");
    });
    */

    function numberChange(dom){
	var checked = dom.parents(".lamp-ul").find(".group").prop("checked");
	if(checked){
	    //alert("aa");
	    var lamp_ul = dom.parents(".lamp-ul");
	    var key = lamp_ul.find(".key").val();
	    var x = lamp_ul.find("input[name=x]").val();
	    var y = lamp_ul.find("input[name=y]").val();
	    var bri = lamp_ul.find("input[name=bri]").val();
	    
	    var lamps = $("#lamp-form").children(".lamp");
	    //alert(lamps.length);
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
    //$('.number').keypress(function() {
    //$('.number').on( 'input', function() {
	//isChange = true;
	//delSuccessMSG();o
	numberChange($(this));
    });
    // deleteキーとbackspaceキーの入力を検知
    /*
    $('.number').keyup(function(e) {
	if (e.keyCode == 46 || e.keyCode == 8){
	    numberChange($(this));
	}
    });*/

    $(".on-off-button").click(function(){
	//alert($(this).val());
	var state;
	if($(this).val() == "on"){
	    state = false;
	}else{
	    state = true;
	}

	var key = getKey($(this));

	data = {on: state};
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

    $("#submit-button").click(function(){
	//alert("aa");
	lamps = $("#lamp-form").children(".lamp");
	//alert(lamps.length);
	lamps.each(function(){
	    //var lamp = lamps[i];
	    //alert(key);
	    var key = $(this).find(".key").val();
	    var x = $(this).find("input[name=x]").val();
	    var y = $(this).find("input[name=y]").val();
	    var bri = $(this).find("input[name=bri]").val();
	    //alert(key);
	    alert(x);
	    $.ajax({
		url: "http://" + ip + "/api/" + user + "/lights/" + key + "/state",
		type: "PUT",
		data: {
		    x: x,
		    y: y,
		    bri: bri
		},
		success: function( data ) {

		}
	    });

	});
	
    });

    a = {
	"1": {
            "name": "Hue Lamp"
	},
	"2": {
            "name": "Hue Lamp 1"
	},
	"3": {
            "name": "Hue Lamp 2"
	}
    };
    //alert(a.length);
    for( var key in a){
	//alert(a[key]["name"]);
    }

    var ip = "192.168.0.147"
    var user = "newdeveloper"

    //get lights

    $.ajax({
	url: "http://" + ip + "/api/" + user + "/lights",
	type: "GET",
	data: {
	    //zipcode: 97201
	},
	success: function( data ) {
	    //data = a;
	    for( var key in data){
		//alert(data[key]["state"]["on"]);
		var newlamp = $( "#origin-lamp" ).clone(true);

		// on or off
		if(data[key]["state"]["on"]){
		    newlamp.find(".on-off-button").val("on");
		}else{
		    newlamp.find(".on-off-button").val("off");
		}
		//x y bri
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
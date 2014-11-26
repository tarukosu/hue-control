$(document).ready(function(){
    function getKey(dom){
	return dom.parents(".lamp-ul").find(".key").val();
    }
    $(".on-off-button").click(function(){
	//alert($(this).val());
	var state;
	if($(this).val() == "on"){
	    state = true;
	    $(this).val("off");
	}else{
	    state = false;
	    $(this).val("on");
	}
//	var key = $(this).parents(".lamp-ul").find(".key").val();
	var key = getKey($(this));
	alert(key);
	$.ajax({
	    url: "http://" + ip + "/api/" + user + "/lights/" + key + "/state",
	    type: "PUT",
	    data: {
		on: state
	    },
	    success: function( data ) {
		if(state){
		    $(this).val("off");
		}else{
		    $(this).val("on");
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

    var ip = "172.0.0.1";
    var user = "newdeveloper"

    //get lights

    $.ajax({
	url: "http://" + ip + "/api/" + user + "/lights",
	type: "GET",
	data: {
	    //zipcode: 97201
	},
	success: function( data ) {
	    data = a;
	    for( var key in data){

		alert(data[key]["name"]);
		$( "#origin-lamp" ).clone(true).attr("id", "").insertBefore( $("#origin-lamp") );
	    }
	}
    });

    //test
    data = a;
    for( var key in data){
	//alert(data[key]["name"]);
	var newlamp = $( "#origin-lamp" ).clone(true);
	newlamp.find(".key").val(key);
	newlamp.show().removeAttr("id").addClass("lamp").insertBefore( $("#origin-lamp") );
    }

    //test

    alert("jQueryファイルの読み込み完了でーす。")
});
$(document).ready(function(){
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
    $.ajax({
	url: "http://" + ip + "/api/" + user + "lights",
	data: {
	    //zipcode: 97201
	},
	success: function( data ) {
	    data = a;
	    for( var key in data){

		alert(data[key]["name"]);
		$( "#origin-lamp" ).clone(true).attr("id", "").insertBefore( $("#origin-lamp") );
	    }

	    //$( "#weather-temp" ).html( "<strong>" + data + "</strong> degrees" );
	}
    });
    //test
    data = a;
    for( var key in data){

	//alert(data[key]["name"]);
	$( "#origin-lamp" ).clone(true).show().removeAttr("id").insertBefore( $("#origin-lamp") );
    }

    //

    alert("jQueryファイルの読み込み完了でーす。")
});
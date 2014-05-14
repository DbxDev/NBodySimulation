$(document).ready(function () {

    
    $('#numberOfSpheres').slider({
        range: "min",
        value: 1250,
        min: 1,
        max: 1500,
        slide : function(event, ui) {
            $( "#numberOfSphereDisplay" ).val( ui.value );
        }
    });
    $( "#numberOfSphereDisplay" ).val( $('#numberOfSpheres').slider( "value" ) );
    $('#radiusOfSpheres').slider({
        range: "min",
        value: 2,
        min: 0,
        max: 50,
        slide : function(event, ui) {
            $( "#radiusDisplay" ).val( ui.value / 1000 );
        }
    });
    $( "#radiusDisplay" ).val( function(){return $('#radiusOfSpheres').slider( "value" ) / 1000});
    $('button#startBrownian').click(function(){
        N = $("input#numberOfSphereDisplay").val();
        R = $("input#radiusDisplay").val();
		N = parseInt(N); R = parseFloat(R);
        try {
			startBrownian(N,R);
		} catch(e) {
			$('#error').text(e.message);
		}
    });

    $('button#startStandart').click(function(){
        N = $("input#numberOfSphereDisplay").val();
        R = $("input#radiusDisplay").val();
		N = parseInt(N); R = parseFloat(R);
        try {
			startStandard(N,R);
		} catch(e) {
			$('#error').text(e.message);
		}
    });
    $("#stopSimulation").click(function(){
        stopSimulation(function(){
            $('#message').text("Simulation stopped.");
            $('#error').text("");
			clearCanvas();
            setTimeout(function(){ $('#message').text("");},3000);
        });
    })
});
function clearCanvas(){
	STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD, STATIC_VALUES.MAX_X_COORD, STATIC_VALUES.MAX_Y_COORD);
}
function createSlider(idSelector, idDisplay) {
    $('#'+id).slider({
        range: "min",
        value: 37,
        min: 1,
        max: 700
    });
    if (idDisplay) {
        $('#'+id).slide(function(event, ui) {
            $( "#"+idDisplay ).val( "$" + ui.value );
        });
    }
}
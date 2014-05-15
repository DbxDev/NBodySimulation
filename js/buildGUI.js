var STANDART_SIMULATION = "0";
var BROWNIAN_SIMULATION = "1";
$(document).ready(function () {
	createSlider('numberOfSpheresNormal' , 1250, 1 , 2000,'numberOfSphereDisplayNormal' , callbackSlideValue('numberOfSphereDisplayNormal'));
    createSlider('radiusOfSpheresNormal' , 2 , 0 , 50,'radiusDisplayNormal' , callbackSlideValueRadius('radiusDisplayNormal'));
	$( "#radiusDisplayNormal" ).val( $("#radiusOfSpheresNormal").slider( "value" )/1000 );
	
	createSlider('numberOfSpheresBrownian' , 1250, 1 , 1500,'numberOfSphereDisplayBrownian' , callbackSlideValue('numberOfSphereDisplayBrownian'));
    createSlider('radiusOfSpheresBrownian' , 2, 0 , 10,'radiusDisplayBrownian' , callbackSlideValueRadius('radiusDisplayBrownian'));
	$( "#radiusDisplayBrownian" ).val( $("#radiusOfSpheresBrownian").slider( "value" )/1000 );
	
    $('button#startBrownian').click(function(){
        N = $("input#numberOfSphereDisplayBrownian").val();
        R = $("input#radiusDisplayBrownian").val();
		N = parseInt(N); R = parseFloat(R);
        try {
			startBrownian(N,R);
		} catch(e) {
			$('#error').text(e.message);
		}
    });

    $('button#startButton').click(function(){
		$(this).addClass('disabled');
		if (isStandard()) {
			N = $("input#numberOfSphereDisplayNormal").val();
			R = $("input#radiusDisplayNormal").val();
		} else if  (isBrownian()) {
			N = $("input#numberOfSphereDisplayBrownian").val();
			R = $("input#radiusDisplayBrownian").val();
		} else {
			return ;
		}
		N = parseInt(N); R = parseFloat(R);
        try {
			if ($(this).hasClass('disabled')) {
				if (isStandard())
					startStandard(N,R);
				else if (isBrownian())
					startBrownian(N,R);
			}	
		} catch(e) {
			$('#error').text(e.message);
		}
		$(this).removeClass('disabled');
    });
    $("#stopSimulation").click(function(){
        stopSimulation(function(){
            $('#message').text("Simulation stopped.");
            $('#error').text("");
			clearCanvas();
            setTimeout(function(){ $('#message').text("");},3000);
        });
    });
});
function getSimulationType(){
	if ($("dd#standard").hasClass('active') ) return STANDART_SIMULATION;
	if ($("dd#brownian").hasClass('active') ) return BROWNIAN_SIMULATION;
}
function isStandard(){
	return getSimulationType() == STANDART_SIMULATION;
}
function isBrownian(){
	return getSimulationType() == BROWNIAN_SIMULATION;
}
function callbackSlideValue(idDisplay) {
	return function(event, ui) {
            $( "#"+idDisplay ).val( ui.value );
    };
}
function callbackSlideValueRadius(idDisplay){
	return function(event, ui) {
            $( "#"+idDisplay ).val( ui.value / 1000 );
    };
};


function clearCanvas(){
	STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD, STATIC_VALUES.MAX_X_COORD, STATIC_VALUES.MAX_Y_COORD);
}
function createSlider(idSelector, value, min , max , idDisplay ,callback) {
    $('#'+idSelector).slider({
        range: "min",
        value: value,
        min: min,
        max: max
    });
    if (idDisplay && callback) {
        $('#'+idSelector).on("slide" , callback);
		$( "#"+idDisplay ).val( $('#'+idSelector).slider( "value" ) );
    }
}
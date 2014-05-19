var STANDART_SIMULATION = "0";
var BROWNIAN_SIMULATION = "1";
var HEATDIFFUSION_SIMULATION = "2";
var GASDIFFUSION_SIMULATION = "3";

$(document).ready(function () {	
	createSlider('numberOfSpheresNormal' , 1250, 1 , 2000,'numberOfSphereDisplayNormal' , callbackSlideValue('numberOfSphereDisplayNormal'));
    createSlider('radiusOfSpheresNormal' , 2 , 0 , 50,'radiusDisplayNormal' , callbackSlideValueRadius('radiusDisplayNormal'));
	$( "#radiusDisplayNormal" ).val( $("#radiusOfSpheresNormal").slider( "value" )/1000 );
	
	
	createSlider('numberOfSpheresBrownian' , 1250, 1 , 1500,'numberOfSphereDisplayBrownian' , callbackSlideValue('numberOfSphereDisplayBrownian'));
    createSlider('radiusOfSpheresBrownian' , 2, 0 , 10,'radiusDisplayBrownian' , callbackSlideValueRadius('radiusDisplayBrownian'));
	$( "#radiusDisplayBrownian" ).val( $("#radiusOfSpheresBrownian").slider( "value" )/1000 );
	
	// Diffusion 1 : temperature diff
	createSlider('numberOfSpheresHeatDiffusion' , 700, 500 , 1500,'numberOfSphereDisplayHeatDiffusion' , callbackSlideValue('numberOfSphereDisplayHeatDiffusion'));
	createSlider('radiusOfSpheresHeatDiffusion' , 10, 0 , 20,'radiusDisplayHeatDiffusion' , callbackSlideValueRadius('radiusDisplayHeatDiffusion'));
	$( "#radiusDisplayHeatDiffusion" ).val( $("#radiusOfSpheresHeatDiffusion").slider( "value" )/1000 );
	
	createSlider('rightTemperatureHeatDiffusion' , 90, 0 , 100,'rightTemperatureDisplayHeatDiffusion' , callbackSlideValue('rightTemperatureDisplayHeatDiffusion'));
	createSlider('leftTemperatureHeatDiffusion' , 10, 0 , 100,'leftTemperatureDisplayHeatDiffusion' , callbackSlideValue('leftTemperatureDisplayHeatDiffusion'));
	
	// Diffusion 2 : gas diff
	createSlider('numberOfSpheresGasDiffusion' , 700, 500 , 1500,'numberOfSphereDisplayGasDiffusion' , callbackSlideValue('numberOfSphereDisplayGasDiffusion'));
	createSlider('radiusOfSpheresGasDiffusion' , 10, 0 , 20,'radiusDisplayGasDiffusion' , callbackSlideValueRadius('radiusDisplayGasDiffusion'));
	$( "#radiusDisplayGasDiffusion" ).val( $("#radiusOfSpheresGasDiffusion").slider( "value" )/1000 );

	
    // $('button#startBrownian').click(function(){
        // N = $("input#numberOfSphereDisplayBrownian").val();
        // R = $("input#radiusDisplayBrownian").val();
		// N = parseInt(N); R = parseFloat(R);
        // try {
			// startBrownian(N,R);
		// } catch(e) {
			// $('#error').text(e.message);
		// }
    // });

    $('button#startButton').click(function(){
		$(this).addClass('disabled');
		var N , R;
		if (isStandard()) {
			N = $("input#numberOfSphereDisplayNormal").val();
			R = $("input#radiusDisplayNormal").val();
		} else if  (isBrownian()) {
			N = $("input#numberOfSphereDisplayBrownian").val();
			R = $("input#radiusDisplayBrownian").val();
		} else if (isHeatDiffusion()) {
			var T_left,T_right;
			N = $("input#numberOfSphereDisplayHeatDiffusion").val();
			R = $("input#radiusDisplayHeatDiffusion").val();
			T_left = $("input#leftTemperatureDisplayHeatDiffusion").val();
			T_right = $("input#rightTemperatureDisplayHeatDiffusion").val();
			T_left = parseInt(T_left);
			T_right = parseInt(T_right)
		} else if (isGasDiffusion()) {
			N = $("input#numberOfSphereDisplayGasDiffusion").val();
			R = $("input#radiusDisplayGasDiffusion").val();
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
				else if (isHeatDiffusion())
					startHeatDiffusion(N,R,T_left,T_right);
				else if (isGasDiffusion())
					startGasDiffusion(N,R);
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
	if ($("dd#heatDiffusion").hasClass('active') ) return HEATDIFFUSION_SIMULATION;
	if ($("dd#gasDiffusion").hasClass('active') ) return GASDIFFUSION_SIMULATION;
}
function isStandard(){
	return getSimulationType() == STANDART_SIMULATION;
}
function isBrownian(){
	return getSimulationType() == BROWNIAN_SIMULATION;
}
function isHeatDiffusion(){
	return getSimulationType() == HEATDIFFUSION_SIMULATION;
}
function isGasDiffusion(){
	return getSimulationType() == GASDIFFUSION_SIMULATION;
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
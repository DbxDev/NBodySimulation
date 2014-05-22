var STANDART_SIMULATION = "0";
var BROWNIAN_SIMULATION = "1";
var HEATDIFFUSION_SIMULATION = "2";
var GASDIFFUSION_SIMULATION = "3";

$(document).ready(function () {	
	createSlider('numberOfSpheresNormal' , 1250, 1 , 2000,'numberOfSphereDisplayNormal' , callbackSlideValue('numberOfSphereDisplayNormal'));
    createSlider('radiusOfSpheresNormal' , 2 , 1 , 50,'radiusDisplayNormal' , callbackSlideScaledValue('radiusDisplayNormal',1000));
	$( "#radiusDisplayNormal" ).val( $("#radiusOfSpheresNormal").slider( "value" )/1000 );
	
	
	createSlider('numberOfSpheresBrownian' , 1250, 1 , 1500,'numberOfSphereDisplayBrownian' , callbackSlideValue('numberOfSphereDisplayBrownian'));
    createSlider('radiusOfSpheresBrownian' , 2, 1 , 10,'radiusDisplayBrownian' , callbackSlideScaledValue('radiusDisplayBrownian',1000));
	$( "#radiusDisplayBrownian" ).val( $("#radiusOfSpheresBrownian").slider( "value" )/1000 );
	
	// Diffusion 1 : temperature diff
	createSlider('numberOfSpheresHeatDiffusion' , 700, 500 , 1500,'numberOfSphereDisplayHeatDiffusion' , callbackSlideValue('numberOfSphereDisplayHeatDiffusion'));
	createSlider('radiusOfSpheresHeatDiffusion' , 10, 1 , 20,'radiusDisplayHeatDiffusion' , callbackSlideScaledValue('radiusDisplayHeatDiffusion',1000));
	$( "#radiusDisplayHeatDiffusion" ).val( $("#radiusOfSpheresHeatDiffusion").slider( "value" )/1000 );
	
	createSlider('rightTemperatureHeatDiffusion' , 90, 1 , 100,'rightTemperatureDisplayHeatDiffusion' , callbackSlideValue('rightTemperatureDisplayHeatDiffusion'));
	createSlider('leftTemperatureHeatDiffusion' , 10, 1 , 100,'leftTemperatureDisplayHeatDiffusion' , callbackSlideValue('leftTemperatureDisplayHeatDiffusion'));
	
	// Diffusion 2 : gas diff
	createSlider('numberOfSpheresGasDiffusion' , 800, 10 , 1500,'numberOfSphereDisplayGasDiffusion' , callbackSlideValue('numberOfSphereDisplayGasDiffusion'));
	createSlider('radiusOfSpheresGasDiffusion' , 4, 1 , 20,'radiusDisplayGasDiffusion' , callbackSlideScaledValue('radiusDisplayGasDiffusion',1000));
	createSlider('velocityGasDiffusion' , 1, 1 , 100,'velocityDisplayGasDiffusion' , callbackSlideScaledValue('velocityDisplayGasDiffusion',100));
	$( "#velocityDisplayGasDiffusion" ).val( $("#velocityGasDiffusion").slider( "value" )/100 );
	$( "#radiusDisplayGasDiffusion" ).val( $("#radiusOfSpheresGasDiffusion").slider( "value" )/1000 );
	
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
			V =$("input#velocityDisplayGasDiffusion").val();
			V = parseFloat(V);
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
					startGasDiffusion(N,R,V);
			}	
		} catch(e) {
			buildMessage(e.message , TYPE_ALERT);
		}
		$(this).removeClass('disabled');
    });
	
    $("#stopSimulation").click(function(){
        stopSimuClearAndNotify();
    });
	
	$('#art_mod').attr('checked',false);
	$('#art_mod').change(function(){
		if ($(this).is(':checked'))
			STATIC_VALUES.ARTISTIC_MODE = true;
		else
			STATIC_VALUES.ARTISTIC_MODE = false;
	});
});

function stopSimuClearAndNotify(){
	stopSimulation(function(){
			buildMessage("Simulation stopped.",TYPE_SUCCESS);
			clearCanvas();
        });
}

var TYPE_SUCCESS=0;
var TYPE_ALERT=1;
function buildMessage(text , type){
	if (type == TYPE_SUCCESS )
		class_type="success";
	else if (type == TYPE_ALERT )
		class_type = "alert";
	else
		class_type = "info";
		
	var alert = '<div data-alert class="alert-box '+class_type+' radius">' + text+ '<a href="#" class="close">&times;</a></div>';
	$('#error').append(alert);
	setTimeout(function(){
		$('#error').children().effect( { effect : 'blind' , duration : 3000 , complete : function(){$('#error').text("");} });
		} , 3000);
}

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
	return callbackSlideScaledValue(idDisplay , 1);
}
function callbackSlideScaledValue(idDisplay , scale){
	if (scale !== 1)
		$( "#"+idDisplay ).prop('disabled',true);
		
	return function(event, ui) {
            $( "#"+idDisplay ).val( ui.value / scale );
    };
};

function clearCanvas(){
	STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD, STATIC_VALUES.MAX_X_COORD, STATIC_VALUES.MAX_Y_COORD);
}
function createSlider(idSelector, value, min , max , idDisplay ,callback) {
    var slider = $('#'+idSelector);
	slider.slider({
        range: "min",
        value: value,
        min: min,
        max: max
    });
	if (idDisplay) {
		var display = $('#'+idDisplay);
		display.on('change' , function(){
			console.log(this.value);
			slider.slider({value : this.value});
			this.value=this.value/1000;
		
		});
		if (callback) {
			slider.on("slide" , callback);
			display.val( slider.slider( "value" ) );
		}
	}
}
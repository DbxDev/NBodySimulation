/** animation core
	options format :
		- delay
		- duration
		- delta is a function used for non linear animation speed 
		- step the function execute between each frame
**/
function AnimationCoreConstants() {};
AnimationCoreConstants.LINEAR = function(p) { return p; };
function AnimationCore(){};

function animate( options ) {
	var start = new Date();
	var handler = setInterval( function(){ 
		var timePassed = new Date() - start;
		var progress = timePassed / options.duration;
		if (progress>1) progress = 1 ;
		
		var delta;
		if (options.delta)
			delta = options.delta(progress);
		else 
			delta = AnimationCoreConstants.LINEAR(progress);

		options.step(delta);
		
		if (progress == 1) {
			clearInterval(handler); // end animation
			options.callback();
		}
		
	} , options.delay || 10 ) // 10 ms default value
	
	// handler = 0; // handler receive positive values during setInterval. 0 mean not used.
};

function linearMove(step, delay , duration , callback) {
	options = {	
		delay : delay ,
		duration : duration,
		delta : AnimationCoreConstants.LINEAR,
		step : step,
		callback : callback
	};
	animate(options);
};
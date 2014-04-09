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
        // //console.log("Timepassed : " + timePassed);
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
			if (options.callback) options.callback();
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
function AnimationConstants(){}
AnimationConstants.IDLE_TIME = 10 ; // in ms
AnimationConstants.MAX_FPS = 60; // frames per second
AnimationConstants.PERIOD_FPS = 1/AnimationConstants.MAX_FPS * 1000; // min time in ms between to frame


function AnimationManager() {
	this.events = new Queue(); // a queue of event to draw
	this.spheres = new Array();
	// this.running = false;
}
AnimationManager.prototype.init = function(spheres){
	for (i=0 ; i<spheres.length ; i++)
		this.spheres[i] = spheres[i].clone();
		
	console.log("Initialization complete. Number of elements : " + this.spheres.length);
};
AnimationManager.prototype.startAnimation = function () {
	// Pop an event or wait until one is available
	handler=setInterval( this.animateEvent(), AnimationConstants.PERIOD_FPS || 1/25*1000);
};
AnimationManager.running = false;
AnimationManager.setEndRun = function () { 
	console.log("STOPING RUN...");
	AnimationManager.running = false; 
};
AnimationManager.setRunning = function () { 
	console.log("STARTING RUN...");
	AnimationManager.running = true; 
};
AnimationManager.isRunning = function () { return AnimationManager.running; };
AnimationManager.prototype.animateEvent = function () {
	var AM = this;
    var count=0;
	return function(){
		if (AnimationManager.isRunning()) return;
		console.log("Anim "+count++ + " number of events #"+ AM.events.size );
        if (AM.events.isEmpty()){
            return;
		}
		AnimationManager.setRunning();
        nextAE = AM.events.pop().value;
		console.log("New event : " + nextAE);
		
		    	
		// do animation
    	linearMove(AM.unitStepMove(nextAE.duration) , AnimationConstants.PERIOD_FPS ,nextAE.duration , 
			function(){ 
				AM.updateFromEvent(nextAE); // update speeds as the event has a duration before a collision for the given sphere states
	
				AnimationManager.setEndRun(); // set animation complete
				// console.log("Final state after animation : " + AM.spheres[0] + " -- " + AM.spheres[1]);
			});
	};
};
AnimationManager.prototype.updateFromEvent = function(aEvent) {
	// console.log("UPDATE speeds : " + this.spheres[0] + " -- " + this.spheres[1] + " from event "+aEvent );
	// update speeds if needed
	if (aEvent.sphereA) {
		this.spheres[aEvent.sphereA.id].vx = aEvent.sphereA.vx;
		this.spheres[aEvent.sphereA.id].vy = aEvent.sphereA.vy;
	}
	if (aEvent.sphereB) {
		this.spheres[aEvent.sphereB.id].vx = aEvent.sphereB.vx;
		this.spheres[aEvent.sphereB.id].vy = aEvent.sphereB.vy;
	}
	
	// console.log("UPDATE COMPLETE new speeds : " + this.spheres[0] + " -- " + this.spheres[1] );
};
AnimationManager.prototype.addEvent = function (duration , sphereA , sphereB) {
	var node = new Node(new AnimationEvent(duration, sphereA, sphereB));
    this.events.push(node);
};
AnimationManager.prototype.unitStepMove = function(duration){
	var AM = this; // a copy of the context before the drawing. Sphere positions are not saved. // TODO Rework ?
	var last_progress=0;
	var total_duration = 0;
	return function(progress){
		dprogress= progress - last_progress;
		// ////console.log("Step move on : " + AM.getSpheres() + " with progress="+progress+ " last " + last_progress + " and diff:"+dprogress);
		STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD+1, STATIC_VALUES.MIN_Y_COORD+1, STATIC_VALUES.MAX_X_COORD-1, STATIC_VALUES.MAX_Y_COORD-1);
		InitBackground(STATIC_VALUES.CONTEXT);
		for (var i=0 ; i< AM.spheres.length ; i++ ) {
			AM.spheres[i].Move(dprogress*duration/1000); // need a time in second
			AM.spheres[i].Draw(STATIC_VALUES.CONTEXT);
		}
		last_progress=progress;
		total_duration+=dprogress*duration/1000;
		if (progress == 1) console.log("Total duration : " + total_duration + " total move dx="+ (AM.spheres[0].vx * total_duration) +"dy="+ (AM.spheres[0].vy * total_duration));
	};
};

function AnimationEvent(duration, sphereA, sphereB) {
	this.duration = duration;
	this.sphereA = sphereA;
	this.sphereB = sphereB;
}
AnimationEvent.prototype.toString = function(){
   return "Event ["+this.duration+"ms] "+ this.sphereA + " -- " + this.sphereB;
};

function InitBackground(context){
// Draw the borders
	context.beginPath();
	context.moveTo(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD);
	context.lineTo(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MAX_Y_COORD);
	context.lineTo(STATIC_VALUES.MAX_Y_COORD, STATIC_VALUES.MAX_Y_COORD);
	context.lineTo(STATIC_VALUES.MAX_Y_COORD, STATIC_VALUES.MIN_Y_COORD);
	context.lineTo(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD);
	context.stroke(); // draw the lines only
	context.closePath();
}

// unit test :
function test(){
	AM = new AnimationManager();
	var size = 10;
	var spheres = new Array();
	for (i=0 ; i<size ; i++) {
		spheres[i] = new Sphere(i,i,i,i,i,i,i,i);
	}
	AM.init(spheres);
	console.log("Result : " + AM.spheres);
	console.log("End of AnimationCore test");
};
// test();
/**
 * Created by Dorian on 13/04/14.
 */
function AnimationCore(){};

function AnimationConstants(){}
AnimationConstants.IDLE_TIME = 10 ; // in ms
AnimationConstants.MAX_FPS = 120; // frames per second
AnimationConstants.PERIOD_FPS = 1/AnimationConstants.MAX_FPS * 1000; // min time in ms between to frame
AnimationConstants.FAST_LOOP_PERIOD = 1;
AnimationConstants.MIN_DURATION_FOR_EVENT = 5;
function AnimationManager() {
    this.events = new Queue(); // a queue of event to draw
    this.spheres = new Array();
    this.sumEventTime = 0;
    // this.running = false;
}
AnimationManager.running = false;
AnimationManager.setEndRun = function () {
    AnimationManager.running = false;
};
AnimationManager.setRunning = function () {
    AnimationManager.running = true;
};
AnimationManager.isRunning = function () { return AnimationManager.running; };

AnimationManager.prototype.init = function(spheres){
    for (i=0 ; i<spheres.length ; i++)
        this.spheres[i] = spheres[i].clone();

    console.log("Initialization complete. Number of elements : " + this.spheres.length);
};
AnimationManager.prototype.startAnimation = function () {
    updatePositionLoop=setInterval(this.updatePosition(), AnimationConstants.FAST_LOOP_PERIOD || 1);
    displayLoop = setInterval(this.displayFrame() , AnimationConstants.PERIOD_FPS || 1/25*1000);
};

AnimationManager.prototype.displayFrame = function(){
    AM = this;
    return function(){
        STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD, STATIC_VALUES.MAX_X_COORD, STATIC_VALUES.MAX_Y_COORD);
        STATIC_VALUES.CONTEXT.fillText("N Body Simulation alpha 2014" ,STATIC_VALUES.MIN_X_COORD+20,STATIC_VALUES.MIN_Y_COORD+20);
        STATIC_VALUES.CONTEXT.fillText(FPS.current_fps+" FPS" ,STATIC_VALUES.MAX_X_COORD-40,STATIC_VALUES.MAX_Y_COORD-10 , 40);
        for (var i=0 ; i< AM.spheres.length ; i++ ) {
            AM.spheres[i].Draw(STATIC_VALUES.CONTEXT);
        }

        FPS.frames_displayed++;
    }
};
AnimationManager.prototype.updatePosition = function(){
    var AM = this;
    return function(){
		console.log("Try updatePosition");
		if (AM.events.isEmpty())
			return
        // If short event :
        // update speed and positions
        // stack time
        // If stacked time high enough timeout for the stack time - time elapsed
       if (AnimationManager.isRunning()) {
           return
       }
	   console.log("Begin updatePosition");
        // Take the lock
        AnimationManager.setRunning();
        var start = new Date();
        var event = AM.events.pop();
		console.log("New event : " + event + " from " + AM.events);
        var total_duration = event.duration;
        // Stack event until no more event or enough duration.
        while (total_duration < AnimationConstants.MIN_DURATION_FOR_EVENT && event ) {
            // consuming the short event
            AM.updateAllSpheresPosition(event.duration);
            AM.updateSpeedsFromEvent(event);
            // find the next one and stack it
			if (AM.events.isEmpty())
				break
				
            event = AM.events.pop();
            total_duration += event.duration;
        }
        // long event - split it into pieces
        if (event.duration >= AnimationConstants.MIN_DURATION_FOR_EVENT) {
			// execute immediatly once and then loop until consummed.
            var progress = AnimationConstants.MIN_DURATION_FOR_EVENT;
			AM.updateAllSpheresPosition(AnimationConstants.MIN_DURATION_FOR_EVENT);
			// console.log("Begin SPLIT");
            var handler = setInterval(function(){
				// console.log("In SPLIT");
                progress += AnimationConstants.MIN_DURATION_FOR_EVENT;
                
                if (progress >= event.duration) {
					
					delta =  AnimationConstants.MIN_DURATION_FOR_EVENT - (progress-event.duration) ; // partial move
					AM.updateAllSpheresPosition(delta);
					// console.log("Progress : " + progress + "/"+event.duration+" delta = " + delta + " step =" + AnimationConstants.MIN_DURATION_FOR_EVENT);
					AM.updateSpeedsFromEvent(event);
                    AnimationManager.setEndRun();
					// console.log("End SPLIT");
                    clearInterval(handler);
                }
				
				AM.updateAllSpheresPosition(AnimationConstants.MIN_DURATION_FOR_EVENT);
				
            } , AnimationConstants.MIN_DURATION_FOR_EVENT);
        } else {
			var current = new Date();
            var computation_duration = current - start;
            var delta = total_duration-computation_duration;
            if (delta > 0 ) {
                setTimeout(function() {
                    AnimationManager.setEndRun();
                } , delta );
            } else {
                AnimationManager.setEndRun();
            }
        }
		// console.log("End updatePosition");
    };
};



AnimationManager.prototype.addEvent = function (duration , sphereA , sphereB) {
    this.events.push(new AnimationEvent(duration, sphereA, sphereB));
};
AnimationManager.prototype.updateSpeedsFromEvent = function(aEvent) {
    if (aEvent.sphereA) {
        this.spheres[aEvent.sphereA.id].vx = aEvent.sphereA.vx;
        this.spheres[aEvent.sphereA.id].vy = aEvent.sphereA.vy;
    }
    if (aEvent.sphereB) {
        this.spheres[aEvent.sphereB.id].vx = aEvent.sphereB.vx;
        this.spheres[aEvent.sphereB.id].vy = aEvent.sphereB.vy;
    }
};
// dt in ms > converted to second
AnimationManager.prototype.updateAllSpheresPosition = function(dt){
	var dur = dt / 1000;
    for (var i=0 ; i< AM.spheres.length ; i++ ) {
        AM.spheres[i].Move(dur);
    }
}

function AnimationEvent(duration, sphereA, sphereB) {
    this.duration = duration;
    this.sphereA = sphereA;
    this.sphereB = sphereB;
}
AnimationEvent.prototype.toString = function(){
    return "Event ["+this.duration+"ms] "+ this.sphereA + " -- " + this.sphereB;
};

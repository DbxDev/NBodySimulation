/**
 * Created by Dorian on 13/04/14.
 */
function AnimationCore(){};

function AnimationConstants(){}
AnimationConstants.IDLE_TIME = 10 ; // in ms
AnimationConstants.MAX_FPS = 60; // frames per second
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
        console.log("Drawing");
        STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD, STATIC_VALUES.MAX_X_COORD, STATIC_VALUES.MAX_Y_COORD);
        STATIC_VALUES.CONTEXT.fillText("N Body Simulation alpha 2014" ,STATIC_VALUES.MIN_X_COORD+20,STATIC_VALUES.MIN_Y_COORD+20);
        STATIC_VALUES.CONTEXT.fillText(FPS.current_fps+" FPS" ,STATIC_VALUES.MAX_X_COORD-40,STATIC_VALUES.MAX_Y_COORD-10 , 40);
        for (var i=0 ; i< AM.spheres.length ; i++ ) {
            AM.spheres[i].Draw(STATIC_VALUES.CONTEXT);
            console.log("Spheres status : " + AM.spheres[i]);
        }

        FPS.frames_displayed++;
    }
};
AnimationManager.prototype.updatePosition = function(){
    var AM = this;
    return function(){
        // If short event :
        // update speed and positions
        // stack time
        // If stacked time high enough timeout for the stack time - time elapsed
       if (AnimationManager.isRunning()) {
           return
       }
        // Take the lock
        AnimationManager.setRunning();
        console.log("Updating");
        var start = new Date();
        var event = AM.events.pop().value;
        var total_duration = event.duration;
        // Stack event until no more event or enough duration.
        while (total_duration < AnimationConstants.MIN_DURATION_FOR_EVENT && !AM.events.isEmpty() ) {
            // consuming the short event
            AM.updateAllSpheresPosition(event.duration);
            AM.updateSpeedsFromEvent(event);
            // find the next one and stack it
            event = AM.events.pop().value;
            total_duration += event.duration;
            console.log("updatePosition stacking event");
        }
        // long event - split it into pieces
        if (event.duration >= AnimationConstants.MIN_DURATION_FOR_EVENT) {
            var progress = 0;
            var handler = setInterval(function(){
                progress += AnimationConstants.MIN_DURATION_FOR_EVENT/event.duration;
                AM.updateAllSpheresPosition(AnimationConstants.MIN_DURATION_FOR_EVENT);
                if (progress >= 1) {
                    AM.updateSpeedsFromEvent(event);
                    AnimationManager.setEndRun();
                    clearInterval(handler);
                }
            } , AnimationConstants.MIN_DURATION_FOR_EVENT);
        } else {
            var computation_duration = (new Date()).getMilliseconds() - start.getMilliseconds();
            var delta = computation_duration - total_duration;
            if (delta > 0 ) {
                setTimeout(function() {
                    console.log("updatePosition tempo");
                    AnimationManager.setEndRun();
                } , delta );
            } else {
                AnimationManager.setEndRun();
            }
        }
    };
};



AnimationManager.prototype.addEvent = function (duration , sphereA , sphereB) {
    var node = new Node(new AnimationEvent(duration, sphereA, sphereB));
    this.events.push(node);
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
AnimationManager.prototype.updateAllSpheresPosition = function(dt){
    for (var i=0 ; i< AM.spheres.length ; i++ ) {
        AM.spheres[i].Move(dt);
        console.log("Spheres status : " + AM.spheres[i] + " moved during " + dt);
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

ANIMATION_FRAME = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
			function(fct) {setTimeout(fct , STATIC_VALUES.TIME_STEP)};
           ;
CANCEL_ANIMATION_FRAME = window.cancelAnimationFrame || clearInterval;
/** The event object **/
function Event(sphereA, sphereB, t){
    var a = sphereA;
    var b = sphereB;
    var time = t;
    var collisionA = 0;
    var collisionB = 0;
    var type;
    if (sphereA !== null) collisionA = sphereA.collision;
    if (sphereB !== null) collisionB = sphereB.collision;

    if (sphereA  && sphereB ) 	{
        type = Event.TYPE_SPHERE;
    }
    else if(sphereA) {
        type = Event.TYPE_VERTICAL;
    }
    else if(sphereB) {
        type = Event.TYPE_HORIZONTAL;
    } else {
        type = Event.TYPE_REDRAWN;
    }
    this.getTime = function(){return time;};
    this.getType = function(){return type;};
    this.getVertical =function(){ return a;};
    this.getHorizontal =function(){ return b;};
    this.getVerticalCollision = function(){ return collisionA;};
    this.getHorizontalCollision = function(){ return collisionB;}
}
Event.TYPE_SPHERE=0;
Event.TYPE_VERTICAL=1;
Event.TYPE_HORIZONTAL=2;
Event.TYPE_REDRAWN=3;
// We need a min priority queue ie : min valuee on top of the heap.
Event.prototype.compareTo = function(other) {
    if (this.getTime() < other.getTime()) return 1;
    else if (this.getTime() === other.getTime()) return 0;
    else return -1;
};
Event.prototype.toString = function(){
    return "Event{"+this.getType()+"-"+this.isValid()+"} [" + this.getTime() +"] a="+this.getVertical()+" ; b="+this.getHorizontal();
};
/** update speeds **/
Event.prototype.doBounce = function(){
    if (this.getType() == Event.TYPE_SPHERE) this.getVertical().bounceOff(this.getHorizontal());
    else if (this.getType() == Event.TYPE_VERTICAL) this.getVertical().bounceOffVerticalWall();
    else if (this.getType() == Event.TYPE_HORIZONTAL) this.getHorizontal().bounceOffHorizontalWall();
    else throw new Error("No sphere in this event !");

};

Event.prototype.isValid = function(){
    var result = true;
    // If the number of collisions has changed > the event is no more valid
    if (this.getVertical() != null)
        result = result && this.getVertical().collision == this.getVerticalCollision();
    if (this.getHorizontal() != null)
        result = result && this.getHorizontal().collision == this.getHorizontalCollision();

    return result;
};

/** The collision manager **/
function CollisionManager(sphereList){
    if (STATIC_VALUES == undefined) throw new Error("STATIC_VALUES instance not set.");
    var events = new PriorityQueue();
    var spheres = sphereList;

    var size = spheres.length;
    var that = this;
    var time=0;
    
    this.aborted = false;
    this.abortOrder = false;
    this.getSize = function() { return size;};
    this.getEvents = function() { return events;};
    this.getSpheres = function() { return spheres ;};
    this.getTime = function() { return time ; };
    this.sizeEventList = function(){ return events.Size(); };
    this.setTime = function(t) {  time = t;   };
    this.printable = function() {
        return events.printable();
    };
}

CollisionManager.prototype.getEventRealDuration = function(event){
    return event.getTime()-this.getTime();
};

CollisionManager.prototype.init = function() {
	console.log("Init CM : " + this.getSize() + " spheres " + " events " + this.getEvents().Size());
    for (i=0 ; i<this.getSize() ; i++)
        this.predict(this.getSpheres()[i],0);
		
	this.predict(null , 0);
}
/** Predicts all the events for a given sphere **/
CollisionManager.prototype.predict = function(sphereA , t) {
	// No sphere : redrawn event.
	var dt;
	if (sphereA == null) {
		this.getEvents().Insert(new Event(null , null , t + STATIC_VALUES.PERIOD_FPS ) );
		return
	}
	var sphereB;
    for (var i=0 ; i< this.getSize() ; i++) {
        sphereB = this.getSpheres()[i];
        // no event on self
        if (sphereA === sphereB) continue;
        // computing the time to hit, if finite > new event
        dt = sphereA.timeToHit(sphereB);
        if (dt != STATIC_VALUES.INFINITE && dt < STATIC_VALUES.TIME_LIMIT) {
            this.getEvents().Insert(new Event(sphereA , sphereB, t+dt ) );
        }
    }
    dt = sphereA.TimeToHitVerticalWall();
    if ( dt != STATIC_VALUES.INFINITE && dt < STATIC_VALUES.TIME_LIMIT) {
        this.getEvents().Insert(new Event(sphereA , null, t+dt ));
    }
    dt = sphereA.TimeToHitHorizontalWall();
    if ( dt != STATIC_VALUES.INFINITE && dt < STATIC_VALUES.TIME_LIMIT) {
        this.getEvents().Insert(new Event(null , sphereA, t+dt ) );
    }
};

CollisionManager.prototype.nextEvent = function(){
    var next = this.getEvents().DelMax();
    while (!next.isValid()){
        next = this.getEvents().DelMax();
    }
    return next;
};
/** update speeds and queue all new events **/
CollisionManager.prototype.resolveEvent = function(event){
    // update simulation position
	var dt = this.getEventRealDuration(event) ;
	
    this.moveSpheres( dt );
    if (event.getType() == Event.TYPE_REDRAWN) {
		this.displayFrame();
	} else {
		event.doBounce();
	}
    this.updateTime( dt );
    // queue new events.
    this.addFollowingEvents(event);
};


CollisionManager.prototype.updateTime = function(duration , callback) {
    this.setTime(this.getTime() + duration);
    if (callback) callback();
};

CollisionManager.prototype.addFollowingEvents = function(event,callback) {
    if (event.getType() == Event.TYPE_SPHERE) {
        this.predict(event.getVertical(),this.getTime());
        this.predict(event.getHorizontal(),this.getTime());
    } else if (event.getType() == Event.TYPE_VERTICAL) {
        this.predict(event.getVertical(),this.getTime());
    } else if (event.getType() == Event.TYPE_HORIZONTAL) {
        this.predict(event.getHorizontal(),this.getTime());
    } else {
		this.predict(null , this.getTime());
	}
    if (callback) callback();
};
CollisionManager.prototype.simulate = function(){
	var CM = this;
	simulationTime= this.getTime();
	return function(){
        if (CM.abortOrder){
            CM.aborted=true;
            return;
        }

		var next = CM.nextEvent();
		while ( next.getType() != Event.TYPE_REDRAWN ) {
			CM.resolveEvent(next);
			next = CM.nextEvent();
		}
		CM.resolveEvent(next); // Draw
		
		ANIMATION_FRAME(CM.simulate());
	};
};
CollisionManager.prototype.abort = function(){
    this.abortOrder = true;
};

CollisionManager.prototype.moveSpheres = function(duration) {
	var max = this.getSize()
    for (var i=0 ; i< max ; i++ ) {
        this.getSpheres()[i].Move(duration);
    }
};

CollisionManager.prototype.displayFrame = function(){
	if (!STATIC_VALUES.ARTISTIC_MODE)
		STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD, STATIC_VALUES.MAX_X_COORD, STATIC_VALUES.MAX_Y_COORD);

	for (var i=0 ; i< this.getSize() ; i++ ) {
		this.getSpheres()[i].Draw(STATIC_VALUES.CONTEXT);
	}

    STATIC_VALUES.CONTEXT.fillStyle = "black";
    STATIC_VALUES.CONTEXT.fillText(FPS.current_fps+" FPS" ,STATIC_VALUES.MAX_X_COORD-45,STATIC_VALUES.MAX_Y_COORD-10 , 40);
    // STATIC_VALUES.CONTEXT.fillText(this.getSize() +" spheres",STATIC_VALUES.MAX_X_COORD-65,STATIC_VALUES.MAX_Y_COORD-20 , 60);

	FPS.frames_displayed++;

};

// Result between 0 and 1
function normalizedXDistance(distance){
    return Math.round(distance * STATIC_VALUES.NORM_X_RATIO);
}
function normalizedYDistance(distance){
    return Math.round(distance * STATIC_VALUES.NORM_Y_RATIO);
}



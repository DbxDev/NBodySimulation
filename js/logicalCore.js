/** The event object **/
function Event(sphereA, sphereB, t){
    var a = sphereA;
    var b = sphereB;
    var time = t;
    // var duration = dur;
    var collisionA = 0;
    var collisionB = 0;
    var type;
    if (sphereA !== null) collisionA = sphereA.collision;
    if (sphereB !== null) collisionB = sphereB.collision;

    if (sphereA  && sphereB ) 	{
        type = Event.TYPE_SPHERE;
        ////console.log("New event of type TYPE_SPHERE");
    }
    else if(sphereA) {
        type = Event.TYPE_VERTICAL;
        ////console.log("New event of type TYPE_VERTICAL");
    }
    else if(sphereB) {
        type = Event.TYPE_HORIZONTAL;
        ////console.log("New event of type TYPE_HORIZONTAL");
    } else {
        throw new Error("Unable to set a type to the event.");
    }
    this.getTime = function(){return time;};
    this.getType = function(){return type;};
    this.getVertical =function(){ return a;};
    this.getHorizontal =function(){ return b;};
    this.getVerticalCollision = function(){ return collisionA;};
    this.getHorizontalCollision = function(){ return collisionB;}
    // this.getDuration =function(){ return duration;};
}
Event.TYPE_SPHERE=0;
Event.TYPE_VERTICAL=1;
Event.TYPE_HORIZONTAL=2;

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
    // console.log("BEFORE Bouncing " + this.getVertical() + " -- " + this.getHorizontal() );
    if (this.getType() == Event.TYPE_SPHERE) this.getVertical().bounceOff(this.getHorizontal());
    else if (this.getType() == Event.TYPE_VERTICAL) this.getVertical().bounceOffVerticalWall();
    else if (this.getType() == Event.TYPE_HORIZONTAL) this.getHorizontal().bounceOffHorizontalWall();
    else throw new Error("No sphere in this event !");

    // console.log("AFTER Bouncing " + this.getVertical() + " -- " + this.getHorizontal() );
};

// NON SENCE. We need to move all the spheres not only those of the event
// Event.prototype.moveSpheres = function() {
// ////console.log("Moving sphere(s).");
// if (this.getType() == Event.TYPE_SPHERE) {
// this.getHorizontal().Move(this.getDuration());
// this.getVertical().Move(this.getDuration());
// } else if (this.getType() == Event.TYPE_VERTICAL) {
// this.getVertical().Move(this.getDuration());
// } else if (this.getType() == Event.TYPE_HORIZONTAL) {
// this.getHorizontal().Move(this.getDuration());
// }
// }
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
    this.AM = new AnimationManager();
    this.running = false;
    ////console.log("Building a CM with "+size+" spheres : " + spheres);
    this.getSize = function() { return size;};
    this.getEvents = function() { return events;};
    this.getSpheres = function() { return spheres ;};
    this.getTime = function() { return time ; };
    // this.setTime = function(t) { this.time = t; };
    this.sizeEventList = function(){ return events.Size(); };
    this.setTime = function(t) {  time = t;   };
    this.printable = function() {
        return events.printable();
    };
}

CollisionManager.prototype.getEventRealDuration = function(event){
    //console.log("Event duration : " + event.getTime() +" - " + this.getTime() + " = " + (event.getTime()-this.getTime()));
    return event.getTime()-this.getTime();
};

CollisionManager.prototype.init = function() {
    for (i=0 ; i<this.getSize() ; i++)
        this.predict(this.getSpheres()[i],0);

    this.AM.init(this.getSpheres());
    this.AM.startAnimation();
}
/** Predicts all the events for a given sphere **/
CollisionManager.prototype.predict = function(sphereA , t) {
    ////console.log("Predict future of "+ sphereA + " at time " + t);
    for (var i=0 ; i< this.getSize() ; i++) {
        sphereB = this.getSpheres()[i];
        ////console.log("Collision "+sphereA+"--"+sphereB);
        // no event on self
        if (sphereA === sphereB) continue;
        // computing the time to hit, if finite > new event
        dt = sphereA.timeToHit(sphereB);
        ////console.log("Collision "+sphereA+"--"+sphereB + " at time " + (t+dt) );
        if (dt != STATIC_VALUES.INFINITE) {
            this.getEvents().Insert(new Event(sphereA , sphereB, t+dt ) );
        }
    }
    ////console.log("Vertical Collision "+sphereA);
    dt = sphereA.TimeToHitVerticalWall();
    ////console.log("at time " + (t+dt) );
    if ( dt != STATIC_VALUES.INFINITE) {
        this.getEvents().Insert(new Event(sphereA , null, t+dt ));
    }
    ////console.log("Horizontal Collision "+sphereA);
    dt = sphereA.TimeToHitHorizontalWall();
    ////console.log(" at time " + (t+dt) );
    if ( dt != STATIC_VALUES.INFINITE) {
        this.getEvents().Insert(new Event(null , sphereA, t+dt ) );
    }
};

CollisionManager.prototype.nextEvent = function(){
    next = this.getEvents().DelMax();
    ////console.log("Next event : " + next  );
    while (!next.isValid()){
        next = this.getEvents().DelMax();
        ////console.log("[while] Next event : " + next );
    }
    return next;
};
/** update speeds and queue all new events **/
CollisionManager.prototype.resolveEvent = function(event){

    ////console.log("Resolving event " + event + " at time " + this.getTime() );

    // Add a new drawing event
    var duration = this.getEventRealDuration(event) ; // in s

    // update simulation position
    this.moveSpheres(duration);
    event.doBounce();
    this.updateTime( duration );
    // queue new events.
    CM.addFollowingEvents(event);

    // Send speed and duration infos to the drawing engine
    var vertical = null , horizontal = null;
    if (event.getVertical()) vertical = event.getVertical().clone();
    if (event.getHorizontal()) horizontal = event.getHorizontal().clone();
    this.AM.addEvent(duration* 1000 , vertical , horizontal );

};

CollisionManager.prototype.setEndRun = function () { this.running = false; };

CollisionManager.prototype.updateTime = function(duration , callback) {
    this.setTime(this.getTime() + duration);
    if (callback) callback();
};

CollisionManager.prototype.addFollowingEvents = function(event,callback) {
    if (event.getType() == Event.TYPE_SPHERE) {
        CM.predict(event.getVertical(),CM.getTime());
        CM.predict(event.getHorizontal(),CM.getTime());
    } else if (event.getType() == Event.TYPE_VERTICAL) {
        CM.predict(event.getVertical(),CM.getTime());
    } else if (event.getType() == Event.TYPE_HORIZONTAL) {
        CM.predict(event.getHorizontal(),CM.getTime());
    }
    if (callback) callback();
};

CollisionManager.prototype.doNext = function () {
    CM = this;

    if (CM.running) return;

    CM.running = true;

    //console.log("DoNext at time ["+ CM.getTime()+"]" );
    //return function(){
    var event = CM.nextEvent();
    // computing new
    CM.resolveEvent(event);

    // keep process in idle state if event drawing queue is too big
    if (CM.AM.events.size >= STATIC_VALUES.MIN_EVENTS_IN_QUEUE) {
        ratio = CM.AM.events.size / STATIC_VALUES.MIN_EVENTS_IN_QUEUE;

        handler = setInterval( function(){

            if (CM.AM.events.size <= STATIC_VALUES.MIN_EVENTS_IN_QUEUE) {
                CM.running = false;
                clearInterval(handler);
            }

        } , STATIC_VALUES.LOGIC_IDLE_TIME * ratio);
    } else {
        CM.running = false;
    }

}
CollisionManager.prototype.moveSpheres = function(duration) {
    // console.log("BEFORE Spheres states : " + this.getSpheres());
    for (var i=0 ; i< this.getSpheres().length ; i++ ) {
        this.getSpheres()[i].Move(duration);
    }
};

// Result between 0 and 1
function normalizedXDistance(distance){
    return distance * (STATIC_VALUES.MAX_X_COORD - STATIC_VALUES.MIN_X_COORD)/(STATIC_VALUES.MAX_X-STATIC_VALUES.MIN_X);
}
function normalizedYDistance(distance){
    return distance * (STATIC_VALUES.MAX_Y_COORD - STATIC_VALUES.MIN_Y_COORD) / (STATIC_VALUES.MAX_Y-STATIC_VALUES.MIN_Y);
}
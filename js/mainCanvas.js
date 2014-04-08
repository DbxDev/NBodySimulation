window.onload = function()
{

    var canvas = document.getElementById('my_canvas');
        if(!canvas)
        {
            alert("Canvas not found.");
            return;
        }
    var context = canvas.getContext('2d');
        if(!context)
        {
            alert("Canvas context not found.");
            return;
        }
		
		 // Begin
		STATIC_VALUES = new StaticValues(canvas);
		InitBackground(context);

        allSpheres = new Array();

 /*       for (var i=0 ; i< 10 ; i++ ) {
            allSpheres[i] = new Sphere(i,0.005*i+0.01,1,i*0.1 ,i*0.1 ,0.01*i,0.15*i,(100*i)%255,(10*i+50)%255  ,(10*i+100)%255);
            allSpheres[i].Draw(STATIC_VALUES.CONTEXT);
        }
        */
        R = 0.01;
        for (var i=0 ; i< 30 ; i++ ) {
            allSpheres[i] = new Sphere(i,R,1,(i%8)*(2*R*1.01)+2*R ,intDiv(i,8)%8*(2*R*1.01)+2*R ,i/100,i/100,(100*i)%255,(10*i+50)%255  ,(10*i+100)%255);
            allSpheres[i].Draw(STATIC_VALUES.CONTEXT);
        }
		sphere1 = new Sphere(1,0.01,1,0.6 ,0.5 ,0.1,0.1,255,0  ,0);

		// step = function (dt) {
			// context.clearRect(STATIC_VALUES.MIN_X_COORD+1, STATIC_VALUES.MIN_Y_COORD+1, STATIC_VALUES.MAX_X_COORD-1, STATIC_VALUES.MAX_Y_COORD-1);
			// InitBackground(context)
			// for (var i=0 ; i< spheres.length ; i++ ) {
				// spheres[i].Move(1000*dt);
				// spheres[i].Draw(context);
			// }
		// }
		
		// AnimationCore.linearMove(step , 10 , 10000);
		// return;
		
        sphere2 = new Sphere(2,0.05,1,0.2 ,0.8 ,-0.2,-0.1  ,0  ,255,0);
		////console.log("BEGIN Sphere 1 & 2 in CM. Infinite value set to : " + STATIC_VALUES.INFINITE);
		spheres = new Array(sphere1, sphere2);
		// spheres = new Array(sphere1);
		CM = new CollisionManager(allSpheres);
		CM.init();
		//$('body').prepend(CM.printable());
		////console.log("****************************");
		////console.log("END Sphere 1 & 2 in CM");
		////console.log("****************************");

		// return;
		var count=0;
		//var doNext = function () {CM.resolveEvent(CM.nextEvent());};
		
       CM.resolveEvent(CM.nextEvent());
	   // var test = setInterval(function(){ console.log(count++);}, 500);
	   var handler = setInterval(function() { 
			CM.doNext();
			console.log(count++);
		} , 400);
	   /*
		return;
        while (count<2) {
			////console.log("Step "+count++);
			// Nearest event in time
			next = CM.nextEvent();
			////console.log("New event : "+next);
			////console.log("Events in queue : " + CM.sizeEventList());
			if (isNaN(next.getTime() )) throw new Error("NAN TIME");
			var timeElapse = 0;
			// setInterval(animate(next.getDuration()), STATIC_VALUES.DT*1000); // ms expected here
			CM.resolveEvent(next);
		}
    $('body').append(CM.printable());
		var myInterval = setInterval(animate(100000), STATIC_VALUES.DT*1000);
		
	*/	/** animation function **/
	 /*	function animate(duration){
			
			// timeElapse+=STATIC_VALUES.DT;
			// if (timeElapse >= duration) return;
			// TODO Compute everything
			
			// RAZ canvas
			context.clearRect(STATIC_VALUES.MIN_X_COORD+1, STATIC_VALUES.MIN_Y_COORD+1, STATIC_VALUES.MAX_X_COORD-2, STATIC_VALUES.MAX_Y_COORD-2);
			
			InitBackground(context)
			// TODO : Draw everything
			for (var i=0 ; i< spheres.length ; i++ ) {
                // spheres[i].Move(next.getDuration());
                spheres[i].Draw(context);
            }
			
            // for (var i=0 ; i< 50 ; i++ ) {
                // allSpheres[i].Move(STATIC_VALUES.DT);
                // allSpheres[i].Draw(context);
            // }
			// $('span#valueDuration').replaceWith(timeElapse);
			// ////console.log("Time elapse : " + timeElapse);
        }
		*/
}

/* convention

o------> x
|
|
\/y
*/
function StaticValues(canvas) {
	this.COUNT=0;
	this.CANVAS = canvas;
	this.CONTEXT = canvas.getContext('2d');
	this.BORDER = 0;
	// Simulation values [0;1]
	this.MIN_X = 0;
	this.MIN_Y = 0;
	this.MAX_X = 1;
	this.MAX_Y = 1;
	// Drawing values
	this.MIN_X_COORD = this.BORDER;
	this.MIN_Y_COORD = this.BORDER;
	this.MAX_X_COORD = canvas.width - this.BORDER;
	this.MAX_Y_COORD = canvas.height - this.BORDER;
	/** 1 unit of space = 10 px **/
	this.UNIT_SPACE_TO_PX = 10;
	/** dt **/
	this.DT = 1/30 // in s
    /** Simulation vars **/
    this.INFINITE = 999999999;
	
	////console.log("Static values instanciated.")
}

// function InitBackground(context){
//  // Draw the borders
	// context.beginPath();
	// context.moveTo(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD);
	// context.lineTo(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MAX_Y_COORD);
	// context.lineTo(STATIC_VALUES.MAX_Y_COORD, STATIC_VALUES.MAX_Y_COORD);
	// context.lineTo(STATIC_VALUES.MAX_Y_COORD, STATIC_VALUES.MIN_Y_COORD);
	// context.lineTo(STATIC_VALUES.MIN_X_COORD, STATIC_VALUES.MIN_Y_COORD);
	// context.stroke(); // draw the lines only
	// context.closePath();
// }

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
    if (this.getType() == Event.TYPE_SPHERE) this.getVertical().bounceOff(this.getHorizontal());
    else if (this.getType() == Event.TYPE_VERTICAL) this.getVertical().bounceOffVerticalWall();
    else if (this.getType() == Event.TYPE_HORIZONTAL) this.getHorizontal().bounceOffHorizontalWall();
    else throw new Error("No sphere in this event !");
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
    this.SYNC_ANIM = false;
	////console.log("Building a CM with "+size+" spheres : " + spheres);
	this.getSize = function() { return size;};
	this.getEvents = function() { return events;};
	this.getSpheres = function() { return spheres ;};
	this.getTime = function() { return time ; };
	this.setTime = function(t) { time = t; };
	this.sizeEventList = function(){ return events.Size(); };
	this.getEventRealDuration = function(event){return event.getTime()-time;}
	this.printable = function() {
		return events.printable();
	};
}
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
	// STATIC_VALUES.COUNT++;
	// if (STATIC_VALUES.COUNT > 3)
		// throw new Error("ENOUGH");

	////console.log("Resolving event " + event + " at time " + this.getTime() );
	
	// Add a new drawing event
	var duration = this.getEventRealDuration(event) ; // in s
	this.AM.addEvent(duration* 1000 , event.getVertical() , event.getHorizontal() );
	// update simulation position
	this.moveSpheres(event);
	// compute new position
	//event.moveSpheres();
	// update speeds

	
};

CollisionManager.prototype.SYNC_ANIMATION = function () { this.SYNC_ANIM = true; };

CollisionManager.prototype.updateTime = function(duration , callback) {
	this.setTime(this.getTime() + duration);
	if (callback)
		callback();
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
	//return function(){
	var event = CM.nextEvent()
	event.doBounce();
	// queue new events.
	CM.updateTime( CM.getEventRealDuration(event) );
	CM.addFollowingEvents(event);
	CM.resolveEvent(event);
	//}
}
CollisionManager.prototype.moveSpheres = function(event) {
	for (var i=0 ; i< this.getSpheres().length ; i++ ) {
			this.getSpheres()[i].Move(this.getEventRealDuration(event));
	}
	// delay = STATIC_VALUES.DT*1000 // unit of anim is the ms
	// duration = CM.getEventRealDuration(event)* 1000 // unit of anim is the ms
	////console.log("Animation : " + delay + "ms , dur="+duration+ "ms. Event : " + event);
	// linearMove(this.unitStepMove(duration) , delay ,duration , doNext(this,event));
	//////console.log("Event after animation " + event);
};

CollisionManager.prototype.unitStepMove = function(duration){
	var _this = this; // a copy of the context before the drawing. Sphere positions are not saved. // TODO Rework ?
	var last_progress=0;
	var total_duration = 0;
	return function(progress){
		dprogress= progress - last_progress;
		// ////console.log("Step move on : " + _this.getSpheres() + " with progress="+progress+ " last " + last_progress + " and diff:"+dprogress);
		STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD+1, STATIC_VALUES.MIN_Y_COORD+1, STATIC_VALUES.MAX_X_COORD-1, STATIC_VALUES.MAX_Y_COORD-1);
		InitBackground(STATIC_VALUES.CONTEXT);
		for (var i=0 ; i< _this.getSpheres().length ; i++ ) {
			_this.getSpheres()[i].Move(dprogress*duration/1000); // need a time in second
			_this.getSpheres()[i].Draw(STATIC_VALUES.CONTEXT);
		}
		last_progress=progress;
		total_duration+=dprogress*duration/1000;
		//if (progress == 1) console.log("Total duration : " + total_duration + " total move dx="+ (_this.getSpheres()[0].vx * total_duration) +"dy="+ (_this.getSpheres()[0].vy * total_duration));
	};
};
// CollisionManager.prototype.nextEvent = function(){
	// next = events.DelMax().getValue();
	// while (!next.isValid()){
		// next = events.DelMax().getValue();
	// }
	// return next;
// };
// CollisionManager.prototype.resolveEvent = function(event){
	// this.time += event.getDuration();
	// if (event.type == Event.TYPE_SPHERE) {
		// this.predict(event.getVertical(),this.time);
		// this.predict(event.getHorizontal(),this.time);
	// } else if (event.type == Event.TYPE_VERTICAL) {
		// this.predict(event.getVertical(),this.time);
	// } else if (event.type == Event.TYPE_HORIZONTAL) {
		// this.predict(event.getHorizontal(),this.time);
	// }
// };

// Result between 0 and 1
function normalizedXDistance(distance){
	return distance * (STATIC_VALUES.MAX_X_COORD - STATIC_VALUES.MIN_X_COORD)/(STATIC_VALUES.MAX_X-STATIC_VALUES.MIN_X);
}
function normalizedYDistance(distance){
	return distance * (STATIC_VALUES.MAX_Y_COORD - STATIC_VALUES.MIN_Y_COORD) / (STATIC_VALUES.MAX_Y-STATIC_VALUES.MIN_Y);
}
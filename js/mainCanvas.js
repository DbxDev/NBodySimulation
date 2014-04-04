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

        for (var i=0 ; i< 50 ; i++ ) {
            allSpheres[i] = new Sphere(2*i,1,50+2*i ,300 -3*i,0.1,0.15,3*(i%3),3*((i+1)%3)  ,3*((i+2)%3));
        }
		sphere1 = new Sphere(0.01,1,0.6 ,0.5 ,0.01,.01,255,0  ,0);
		
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
		
        sphere2 = new Sphere(0.05,1,0.2 ,0.8 ,-0.02,-0.1  ,0  ,255,0);
		console.log("BEGIN Sphere 1 & 2 in CM. Infinite value set to : " + STATIC_VALUES.INFINITE);
		// spheres = new Array(sphere1, sphere2);
		spheres = new Array(sphere1);
		CM = new CollisionManager(spheres);
		for (var i=0 ; i< spheres.length ; i++ ) {
			console.log("Predicting " + spheres[i]);
			CM.predict(spheres[i],0);
		}
		$('body').prepend(CM.printable());
		console.log("****************************");
		console.log("END Sphere 1 & 2 in CM");
		console.log("****************************");

		// return;
		var count=0;
		doNext = function () {CM.resolveEvent(CM.nextEvent());};
		while (count<2) {
			console.log("Step "+count++);
			// Nearest event in time
			next = CM.nextEvent();
			console.log("New event : "+next);
			console.log("Events in queue : " + CM.sizeEventList());
			if (isNaN(next.getTime() )) throw new Error("NAN TIME");
			var timeElapse = 0;
			// setInterval(animate(next.getDuration()), STATIC_VALUES.DT*1000); // ms expected here
			CM.resolveEvent(next);
		}
    $('body').append(CM.printable());
		var myInterval = setInterval(animate(100000), STATIC_VALUES.DT*1000);
		
		/** animation function **/
		function animate(duration){
			
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
			// console.log("Time elapse : " + timeElapse);
        }
}

/* convention

o------> x
|
|
\/y
*/
function StaticValues(canvas) {
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
	this.DT = 1/80 // in s
    /** Simulation vars **/
    this.INFINITE = 999999999;
	
	console.log("Static values instanciated.")
}

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
/*
 Object that represents an hard sphere
*/
function Sphere(radius, mass, x , y , vx , vy , r , g ,b){
	this.radius = radius;
	this.mass = mass;
	this.x= x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.color = rgb(r,g,b);
    this.collision = 0; // number of collisions
}
Sphere.prototype.toString = function(){
		return "{Sphere R="+this.radius+" m="+this.mass+" (x,y)="+this.x+","+this.y+" (vx,vy)="+this.vx+","+this.vy+"}";
};
Sphere.prototype.Move = function(dt) {
    // console.log("moving particule " + this +"during dt="+dt+ " dx="+ (this.vx*dt) + " dy="+(this.vy*dt) );
	this.x += (this.vx * dt);
    this.y += (this.vy * dt);
	// console.log("New status " + this);
};
Sphere.prototype.Draw = function(context){
	context.fillStyle = this.color;
	context.beginPath(); 
	//console.log("Drawing : (x,y)=(" + normalizedXDistance(this.x)+","+ normalizedYDistance(this.y) + ")");
	context.arc(normalizedXDistance(this.x), normalizedYDistance(this.y), normalizedXDistance(this.radius), 0, Math.PI*2); // x,y,radius,starting angle, ending angle [, option clockwise]
	context.fill();
	context.closePath();
};
/**
 * For more info about this physical part, see the excellent Booksite :
 * http://algs4.cs.princeton.edu/61event/Particle.java.html
 */

Sphere.prototype.TimeToHitVerticalWall = function(){
    if (this.vx > 0) {
		time = (STATIC_VALUES.MAX_X - this.radius - this.x) / this.vx;
		console.log("[vx="+this.vx+">0] "+this.x+" - "+this.radius+" return "+ time);
		return time;
    }
	else if (this.vx < 0) {
		time = (this.x-this.radius-STATIC_VALUES.MIN_X) / -this.vx;
		console.log("[vx="+this.vx+"<0]  "+this.x+" - "+this.radius+" return "+ time);
		return time;
    }
	else {
		console.log("Else case return "+ STATIC_VALUES.INFINITE);
		return STATIC_VALUES.INFINITE;
	}
};
Sphere.prototype.TimeToHitHorizontalWall = function(){
    if (this.vy > 0) {
		time=(STATIC_VALUES.MAX_Y - this.radius - this.y) / this.vy;
		console.log("[vy="+this.vy+">0]  "+this.y+" - "+this.radius+" return "+time);
		return time;
    }
	else if (this.vy < 0) {
		time = (this.y - this.radius - STATIC_VALUES.MIN_Y) / -this.vy
		console.log("[vy="+this.vy+"<0]  "+this.y+" - "+this.radius+" return "+ time);
		return time;
    }
	else {
		console.log("Else case return "+ STATIC_VALUES.INFINITE);
		return STATIC_VALUES.INFINITE;
	}
};
/**
 * Time to hit a particule
 * @param other
 * @returns {number}
 */
Sphere.prototype.timeToHit = function(other) {
    if (this == other) return STATIC_VALUES.INFINITE;
    var dx = other.x - this.x;
    var dy = other.y - this.y;
    var dvx = other.vx - this.vx;
    var dvy = other.vy - this.vy;
    var dvdr = dx * dvx + dy * dvy;
	console.log(dx+" "+dy+" " + dvx+ " " + dvy + " " +dvdr);
    if (dvdr > 0) {
		console.log("[dvdr="+dvdr+" > 0] return "+ STATIC_VALUES.INFINITE);
		return STATIC_VALUES.INFINITE;
    }
	var dvdv = dvx*dvx + dvy*dvy;
    var drdr = dx*dx + dy*dy;
    var sigma = this.radius + other.radius;
    var d = dvdr*dvdr - dvdv * (drdr - sigma*sigma);
    if (d<=0) {
		console.log("[d="+d+"<0]"+ STATIC_VALUES.INFINITE); 
		return STATIC_VALUES.INFINITE;
	}
	
	console.log("Time to hit between : "+ this + " and " + other + " is " + (- (dvdr + Math.sqrt(d)) / dvdv) + " build with "+dvdr+" " + Math.sqrt(d) + " " + dvdv);
    return -(dvdr + Math.sqrt(d)) / dvdv;
};
/**
 * Bouncing on an other particle
 * @param other
 */
Sphere.prototype.bounceOff = function(other) {
    console.log("Bounce off " + this + " and " + other);
    var dx = other.x - this.x;
    var dy = other.y - this.y;
    var dvx = other.vx - this.vx;
    var dvy = other.vy - this.vy;
    var dvdr = dx * dvx + dy * dvy;
    var dist = this.radius - other.radius;

    // Normal force
    var F = 2 * this.mass * other.mass * dvdr / ((this.mass + other.mass) * dist);
    var fx = F * dx / dist;
    var fy = F * dy / dist;

    // new velocities
    this.vx += fx / this.mass;
    this.vy += fy / this.mass;
    other.vx -= fx / other.mass;
    other.vy -= fy / other.mass;

    this.collision++;
    other.collision++;
};
Sphere.prototype.bounceOffVerticalWall = function(){
    console.log("BEGIN Bouncing off vertical wall " + this);
    this.vx *= -1 ;
    this.collision++;
	console.log("END Bouncing off vertical wall " + this+ " >>> " + this.vx);
};
Sphere.prototype.bounceOffHorizontalWall = function(){
    console.log("BEGIN Bouncing off horizontal wall " + this);
    this.vy *= -1 ;
    this.collision++;
	console.log("END Bouncing off horizontal wall " + this + " >>> " + this.vy);
};

/** The event object **/
function Event(sphereA, sphereB, t,dur){
	var a = sphereA;
	var b = sphereB;
	var time = t;
	var duration = dur;
	var collisionA = 0;
	var collisionB = 0;
    var type;
	if (sphereA !== null) collisionA = sphereA.collision;
	if (sphereB !== null) collisionB = sphereB.collision;

	if (sphereA  && sphereB ) 	{
        type = Event.TYPE_SPHERE;
        console.log("New event of type TYPE_SPHERE");
    }
	else if(sphereA) {
        type = Event.TYPE_VERTICAL;
        console.log("New event of type TYPE_VERTICAL");
    }
	else if(sphereB) {
        type = Event.TYPE_HORIZONTAL;
        console.log("New event of type TYPE_HORIZONTAL");
    } else {
        throw new Error("Unable to set a type to the event.");
    }
    this.getTime = function(){return time;};
    this.getType = function(){return type;};
	this.getVertical =function(){ return a;};
	this.getHorizontal =function(){ return b;};
    this.getVerticalCollision = function(){ return collisionA;};
    this.getHorizontalCollision = function(){ return collisionB;}
	this.getDuration =function(){ return duration;};
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
    return "Event{"+this.getType()+"} [" + this.getTime() +"] a="+this.getVertical()+" ; b="+this.getHorizontal();
};
/** update speeds **/
Event.prototype.doBounce = function(){
    if (this.getType() == Event.TYPE_SPHERE) this.getVertical().bounceOff(this.getHorizontal());
    else if (this.getType() == Event.TYPE_VERTICAL) this.getVertical().bounceOffVerticalWall();
    else if (this.getType() == Event.TYPE_HORIZONTAL) this.getHorizontal().bounceOffHorizontalWall();
    else throw new Error("No sphere in this event !");
};
Event.prototype.moveSpheres = function() {
	console.log("Moving sphere(s).");
	if (this.getType() == Event.TYPE_SPHERE) {
		this.getHorizontal().Move(this.getDuration());
		this.getVertical().Move(this.getDuration());
	} else if (this.getType() == Event.TYPE_VERTICAL) {
		this.getVertical().Move(this.getDuration());
	} else if (this.getType() == Event.TYPE_HORIZONTAL) {
		this.getHorizontal().Move(this.getDuration());
	}
}
Event.prototype.isValid = function(){
    var result = false;
    // If the number of collisions has changed > the event is no more valid
    if (this.getVertical() != null)
        result = result || this.getVertical().collision == this.getVerticalCollision();
    if (this.getHorizontal() != null)
        result = result || this.getHorizontal().collision == this.getHorizontalCollision();

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
	
	console.log("Building a CM with "+size+" spheres : " + spheres);
	this.getSize = function() { return size;};
	this.getEvents = function() { return events;};
	this.getSpheres = function() { return spheres ;};
	this.getTime = function() { return time ; };
	this.setTime = function(t) { time = t; };
	this.sizeEventList = function(){ return events.Size(); };
	this.printable = function() {
		return events.printable();
	};
}
/** Predicts all the events for a given sphere **/
CollisionManager.prototype.predict = function(sphereA , t) {
	console.log("Predict future of "+ sphereA + " at time " + t);
	for (var i=0 ; i< this.getSize() ; i++) {
		sphereB = this.getSpheres()[i];
		console.log("Collision "+sphereA+"--"+sphereB);
		// no event on self
		if (sphereA === sphereB) continue;
		// computing the time to hit, if finite > new event
		dt = sphereA.timeToHit(sphereB);
		console.log("Collision "+sphereA+"--"+sphereB + " at time " + (t+dt) );
		if (dt != STATIC_VALUES.INFINITE) {
			this.getEvents().Insert(new Event(sphereA , sphereB, t+dt ,dt) );
		}
	}
	console.log("Vertical Collision "+sphereA);
	dt = sphereA.TimeToHitVerticalWall();
	console.log("at time " + (t+dt) );
	if ( dt != STATIC_VALUES.INFINITE) {
		this.getEvents().Insert(new Event(sphereA , null, t+dt,dt ));
	}
	console.log("Horizontal Collision "+sphereA);
	dt = sphereA.TimeToHitHorizontalWall();
	console.log(" at time " + (t+dt) );
	if ( dt != STATIC_VALUES.INFINITE) {
		this.getEvents().Insert(new Event(null , sphereA, t+dt,dt ) );
	}
};
	
CollisionManager.prototype.nextEvent = function(){
	next = this.getEvents().DelMax();
	console.log("Next event : " + next  );
	while (!next.isValid()){
		next = this.getEvents().DelMax();
		console.log("[while] Next event : " + next );
	}
	return next;
};
/** update speeds and queue all new events **/
CollisionManager.prototype.resolveEvent = function(event){
	this.setTime(this.getTime() + event.getDuration());		
	console.log("Resolving event " + event + " at time " + this.getTime());
	// VISUALY update positions and draw
	this.moveSpheres(event);
	// compute new position
	event.moveSpheres();
	// update speeds
	event.doBounce();
	// queue new events.
	if (event.getType() == Event.TYPE_SPHERE) {
		this.predict(event.getVertical(),this.getTime());
		this.predict(event.getHorizontal(),this.getTime());
	} else if (event.getType() == Event.TYPE_VERTICAL) {
		this.predict(event.getVertical(),this.getTime());
	} else if (event.getType() == Event.TYPE_HORIZONTAL) {
		this.predict(event.getHorizontal(),this.getTime());
	}
};
CollisionManager.prototype.unitStepMove = function(duration){
	var _this = this; // a copy of the context before the drawing. Sphere are not saved in their position. // TODO Hard rework
	var last_progress=0;
	return function(progress){
		dprogress= progress - last_progress;
		//console.log("Step move on : " + _this.getSpheres() + " with progress="+progress);
		STATIC_VALUES.CONTEXT.clearRect(STATIC_VALUES.MIN_X_COORD+1, STATIC_VALUES.MIN_Y_COORD+1, STATIC_VALUES.MAX_X_COORD-1, STATIC_VALUES.MAX_Y_COORD-1);
		InitBackground(STATIC_VALUES.CONTEXT);
		for (var i=0 ; i< _this.getSpheres().length ; i++ ) {
			_this.getSpheres()[i].Move(dprogress*duration/1000); // need a time in second
			_this.getSpheres()[i].Draw(STATIC_VALUES.CONTEXT);
		}
		last_progress=progress;
	};
};
CollisionManager.prototype.moveSpheres = function(event) {
	delay = STATIC_VALUES.DT*1000 // unit of anim is the ms
	duration = event.getDuration() * 1000 // unit of anim is the ms
	console.log("Animation : " + delay + "ms , dur="+duration+ "ms. Event : " + event);
	linearMove(this.unitStepMove(duration) , delay ,duration , doNext);
	console.log("Event after animation " + event);
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
/** tools **/
function rgb(r,g,b) {
	return "rgb("+r+","+g+","+b+")";
}
// Result between 0 and 1
function normalizedXDistance(distance){
	return distance * (STATIC_VALUES.MAX_X_COORD - STATIC_VALUES.MIN_X_COORD)
}
function normalizedYDistance(distance){
	return distance * (STATIC_VALUES.MAX_Y_COORD - STATIC_VALUES.MIN_Y_COORD)
}
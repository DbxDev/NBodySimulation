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
		sphere1 = new Sphere(10,1,300 ,100 ,0.1,0.1,255,0  ,0);
        sphere2 = new Sphere(25,1,100 ,400 ,-0.1,-0.1  ,0  ,255,0);
		console.log("BEGIN Sphere 1 & 2 in CM. Infinite value set to : " + STATIC_VALUES.INFINITE);
		spheres = new Array(sphere1, sphere2);
		CM = new CollisionManager(spheres);
		for (var i=0 ; i< spheres.length ; i++ ) {
			console.log("Predicting " + spheres[i]);
			CM.predict(spheres[i],0);
		}
		$('body').prepend(CM.printable());
		console.log("END Sphere 1 & 2 in CM");
		// return;
		var count=0;
		while (count<100) {
			console.log("Step "+count++);
			next = CM.nextEvent();
			console.log("New event : "+next);
			console.log("Events in queue : " + CM.sizeEventList());
			if (isNaN(next.time )) throw new Error("NAN TIME");
			var timeElapse = 0;
			// setInterval(animate(next.getDuration()), STATIC_VALUES.DT*1000); // ms expected here
			CM.resolveEvent(next);
			for (var i=0 ; i< spheres.length ; i++ ) {
				spheres[i].Move(next.getDuration());
				spheres[i].Draw(context);
            }
			setTimeout(function(){},1000);
		}
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
	this.BORDER = 20;
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
	
	this.toString = function(){
		return "{Sphere R="+radius+" m="+mass+" (x,y)="+x+","+y+" (vx,vy)="+vx+","+vy+"}";
	}
}
Sphere.prototype.Move = function(dt) {
	this.x += this.vx * dt;
    this.y += this.vy * dt;
}
Sphere.prototype.Draw = function(context){
	context.fillStyle = this.color;
	context.beginPath(); 
	context.arc(this.x, this.y, this.radius, 0, Math.PI*2); // x,y,radius,starting angle, ending angle [, option clockwise]
	context.fill();
	context.closePath();
}
/**
 * For more info about this physical part, see the excellent Booksite :
 * http://algs4.cs.princeton.edu/61event/Particle.java.html
 */

Sphere.prototype.TimeToHitVerticalWall = function(){
    if (this.vx > 0) {
		console.log("[vx="+this.vx+">0] return "+ (STATIC_VALUES.MAX_X_COORD - this.x) / this.vx);
		return (STATIC_VALUES.MAX_X_COORD - this.x) / this.vx;
    }
	else if (this.vx < 0) {
		console.log("[vx="+this.vx+"<0] return "+ (this.x - STATIC_VALUES.MIN_X_COORD) / -this.vx);
		return (this.x - STATIC_VALUES.MIN_X_COORD) / -this.vx;
    }
	else {
		console.log("Else case return "+ STATIC_VALUES.INFINITE);
		return STATIC_VALUES.INFINITE;
	}
};
Sphere.prototype.TimeToHitHorizontalWall = function(){
    if (this.vy > 0) {
		console.log("[vy="+this.vy+">0] return "+ (STATIC_VALUES.MAX_Y_COORD - this.y) / this.vy);
		return (STATIC_VALUES.MAX_Y_COORD - this.y) / this.vy;
    }
	else if (this.vy < 0) {
		console.log("[vy="+this.vy+"<0] return "+ (this.y - STATIC_VALUES.MIN_Y_COORD) / -this.vy);
		return (this.y - STATIC_VALUES.MIN_Y_COORD) / -this.vy;
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
    this.vx = -this.vx ;
    this.collision++;
};
Sphere.prototype.bounceOffHorizontalWall = function(){
    this.vy = -this.vy ;
    this.collision++;
};

/** The event object **/
function Event(sphereA, sphereB, time,duration){
	var a = sphereA;
	var b = sphereB;
	this.time = time;
	var duration = duration;
	var collisionA = 0;
	var collisionB = 0;
	if (sphereA !== null) collisionA = sphereA.collision;
	if (sphereB !== null) collisionB = sphereB.collision;

	that = this;
	
	if (sphereA  && sphereB ) 	this.type = Event.TYPE_SPHERE;
	else if(sphereA) this.type = Event.TYPE_VERTICAL;
	else if(sphereB) this.type = Event.TYPE_HORIZONTAL;
	// We need a min priority queue ie : min valuee on top of the heap.
	this.compareTo = function(other) {
        if (time < other.time) return 1;
		else if (time === other.time) return 0;
		else return -1;
    };
	this.doBounce = function(){
		if (that.type == Event.TYPE_SPHERE) a.bounceOff(b);
		else if (that.type == Event.TYPE_VERTICAL) a.bounceOffVerticalWall();
		else if (that.type == Event.TYPE_HORIZONTAL) b.bounceOffHorizontalWall();
		else throw new Error("No sphere in this event !");
	};
	this.getVertical =function(){ return a;};
	this.getHorizontal =function(){ return b;};
	this.getDuration =function(){ return duration;};
	this.isValid = function(){
		var result = false;
		// If the number of collisions has changed > the event is no more valid
		if (a != null)
			result = result || a.collision == collisionA;
		if (b != null)
			result = result || b.collision == collisionB;
			
		return result;
	};
	this.toString = function(){
		return "Event{"+that.type+"} [" + time +"] a="+a+" ; b="+b;
	};
}
Event.TYPE_SPHERE=0;
Event.TYPE_VERTICAL=1;
Event.TYPE_HORIZONTAL=2;

/** The collision manager **/
function CollisionManager(spheres){
	if (STATIC_VALUES == undefined) throw new Error("STATIC_VALUES instance not set.");
	
	var events = new PriorityQueue();
	var spheres = spheres;
	var size = spheres.length;
	var that = this;
	var time=0;
	console.log("Building a CM with "+size+" spheres : " + spheres);
	/** Predicts all the events for a given sphere **/
	this.predict = function(sphereA , t) {
		for (var i=0 ; i< size ; i++) {
			sphereB = spheres[i];
			console.log("Collision "+sphereA+"--"+sphereB);
			// no event on self
			if (sphereA === sphereB) continue;
			// computing the time to hit, if finite > new event
			dt = sphereA.timeToHit(sphereB);
			console.log("Collision "+sphereA+"--"+sphereB + " at time " + (t+dt) );
			if (dt != STATIC_VALUES.INFINITE) {
				events.Insert(new Event(sphereA , sphereB, t+dt ,dt) );
			}
		}
		console.log("Vertical Collision "+sphereA);
		dt = sphereA.TimeToHitVerticalWall();
		console.log("at time " + (t+dt) );
		if ( dt != STATIC_VALUES.INFINITE) {
			events.Insert(new Event(sphereA , null, t+dt,dt ));
		}
		console.log("Horizontal Collision "+sphereA);
		dt = sphereA.TimeToHitHorizontalWall();
		console.log(" at time " + (t+dt) );
		if ( dt != STATIC_VALUES.INFINITE) {
			events.Insert(new Event(null , sphereA, t+dt,dt ) );
		}
	};
	this.nextEvent = function(){
		next = events.DelMax();
		while (!next.isValid()){
			next = events.DelMax();
		}
		return next;
	};
	this.resolveEvent = function(event){
		time += event.getDuration();
		event.doBounce();
		if (event.type == Event.TYPE_SPHERE) {
			that.predict(event.getVertical(),time);
			that.predict(event.getHorizontal(),time);
		} else if (event.type == Event.TYPE_VERTICAL) {
			that.predict(event.getVertical(),time);
		} else if (event.type == Event.TYPE_HORIZONTAL) {
			that.predict(event.getHorizontal(),time);
		}
	};
	this.sizeEventList = function(){ return events.Size(); }
	this.printable = function() {
		return events.printable();
	};
}
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
function speedPixelConstant(speedNaturalUnit){
	return speedNaturalUnit * STATIC_VALUES.UNIT_SPACE_TO_PX / STATIC_VALUES.DT
}
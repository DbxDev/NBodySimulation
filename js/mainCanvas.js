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

        allSphere = new Array();

        for (var i=0 ; i< 50 ; i++ ) {
            allSphere[i] = new Sphere(2*i,1,50+2*i ,300 -3*i,0.1,0.15,3*(i%3),3*((i+1)%3)  ,3*((i+2)%3));
        }
		sphere1 = new Sphere(10,1,50 ,50 ,0.1,0.15,255,0  ,0);
        sphere2 = new Sphere(25,1,150 ,150 ,0.15,0.10,0  ,255,0);

		var myInterval = setInterval(animate, STATIC_VALUES.DT);
		
		/** animation function **/
		function animate(){
			// TODO Compute everything
			
			// RAZ canvas
			context.clearRect(STATIC_VALUES.MIN_X_COORD+1, STATIC_VALUES.MIN_Y_COORD+1, STATIC_VALUES.MAX_X_COORD-2, STATIC_VALUES.MAX_Y_COORD-2);
			
			InitBackground(context)
			// TODO : Draw everything
			sphere1.Move(STATIC_VALUES.DT);
			sphere1.Draw(context);
            sphere2.Move(STATIC_VALUES.DT);
            sphere2.Draw(context);
            for (var i=0 ; i< 50 ; i++ ) {
                allSphere[i].Move(STATIC_VALUES.DT);
                allSphere[i].Draw(context);
            }
        }

}

/* convention
|-----> y
|
v 
x
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
	this.DT = 1000/80 // in ms
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
    if (this.vx > 0) return (STATIC_VALUES.MAX_X_COORD - this.x) / this.vx;
    if (this.vx < 0) return (this.x - STATIC_VALUES.MIN_X_COORD) / this.vx;
    else return STATIC_VALUES.INFINITE;
};
Sphere.prototype.TimeToHitHorizontalWall = function(){
    if (this.vy > 0) return (STATIC_VALUES.MAX_Y_COORD - this.y) / this.vy;
    if (this.vy < 0) return (this.y - STATIC_VALUES.MIN_Y_COORD) / this.vy;
    else return STATIC_VALUES.INFINITE;
};
/**
 * Time to hit a particule
 * @param other
 * @returns {number}
 */
Sphere.prototype.timeToHit = function(other) {
    if (this === other) return STATIC_VALUES.INFINITE;
    var dx = other.x - this.x;
    var dy = other.y - this.y;
    var dvx = other.vx - this.vx;
    var dvy = other.vy - this.vy;
    var dvdr = dx * dvx + dy * dvy;
    if (dvdr > 0) return STATIC_VALUES.INFINITE;
    var dvdv = dvx*dvx + dvy*dvy;
    var drdr = dx*dx + dy*dy;
    var sigma = this.radius + other.radius;
    var d = dvdr*dvdr - dvdv * (drdr - sigma*sigma);
    if (d<0) return STATIC_VALUES.INFINITE;
    return - (dvdr + Math.sqrt(d)) / dvdv;
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
function Event(sphereA, sphereB, time){
	this.a = sphereA;
	this.b = sphereB;
	this.time = time;
	this.collisionA = 0;
	this.collisionB = 0;
	if (sphereA != undefined) this.collisionA = sphereA.collision;
	if (sphereB != undefined) this.collisionB = sphereB.collision;
	
	this.compareTo = function(other) {
        if (time < other.time) return 1;
		else if (time === other.time) return 0;
		else return -1;
    };
	
	this.toString = function(){
		return "Event [" + time +"] a="+this.a+" ; b="+b;
	};
	this.isValid = function(){
		var result = false;
		// If the number of collisions has changed > the event is no more valid
		if (this.a != undefined)
			result = result || this.a.collision == this.collisionA;
		if (this.b != undefined)
			result = result || this.b.collision == this.collisionB;
			
		return result;
	};
}
/** The collision manager **/
function CollisionManager(){
	this.events = new PriorityQueue();
	
	/** Predicts all the events for a given sphere **/
	this.predict = function(sphere , t) {
		
	}
}


/** tools **/
function rgb(r,g,b) {
	return "rgb("+r+","+g+","+b+")";
}
function speedPixelConstant(speedNaturalUnit){
	return speedNaturalUnit * STATIC_VALUES.UNIT_SPACE_TO_PX / STATIC_VALUES.DT
}
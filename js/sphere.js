/*
 Object that represents an hard sphere
*/
var IDGen = new UniqueIDGenerator();

function Sphere(radius, mass, x , y , vx , vy , r , g ,b , id){
	// Except 0 we require an ID with a valid value
	if (id !== 0  && !id) id = IDGen.newId();
	this.id = id 
	this.radius = radius;
	this.mass = mass;
	this.x= x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.r = r ; this.g = g ; this.b = b
	this.color = rgb(r,g,b);
    this.collision = 0; // number of collisions
}
Sphere.prototype.toString = function(){
		return "{Sphere#"+this.id+" R="+this.radius+" m="+this.mass+" (x,y)="+this.x+","+this.y+" (vx,vy)="+this.vx+","+this.vy+"}";
};
Sphere.prototype.Move = function(dt) {
    // ////console.log("moving particule " + this +"during dt="+dt+ " dx="+ (this.vx*dt) + " dy="+(this.vy*dt) );
	this.x += (this.vx * dt);
    this.y += (this.vy * dt);
	// Test this.x < this.radius || this.y < this.radius || this.x > 1-this.radius || this.y> 1-this.radius
	// ////console.log("New status " + this);
};
Sphere.prototype.Draw = function(context){
	context.fillStyle = this.color;
	context.beginPath(); 
	//////console.log("Drawing : (x,y)=(" + normalizedXDistance(this.x)+","+ normalizedYDistance(this.y) + ")");
	context.arc(normalizedXDistance(this.x), normalizedYDistance(this.y), normalizedXDistance(this.radius), 0, Math.PI*2); // x,y,radius,starting angle, ending angle [, option clockwise]
	context.fill();
	context.closePath();
	context.fillStyle = "black";
	//context.fillText(this.id,normalizedXDistance(this.x),normalizedYDistance(this.y),normalizedXDistance(2*this.radius));
	//context.fillText(this.id,normalizedXDistance(this.x)+normalizedXDistance(this.radius),normalizedYDistance(this.y)-normalizedXDistance(this.radius),normalizedXDistance(2*this.radius));
};
/**
 * For more info about this physical part, see the excellent Booksite :
 * http://algs4.cs.princeton.edu/61event/Particle.java.html
 */

Sphere.prototype.TimeToHitVerticalWall = function(){
    if (this.vx > 0) {
        // already out (possible if dt too big compare to vx)
        if (this.x >= STATIC_VALUES.MAX_X - this.radius) {this.x = STATIC_VALUES.MAX_X - this.radius;}
		time = (STATIC_VALUES.MAX_X - this.radius - this.x) / this.vx;
		////console.log("[vx="+this.vx+">0] "+this.x+" - "+this.radius+" return "+ time);
		return time;
    }
	else if (this.vx < 0) {
        // already out (possible if dt too big compare to vx)
        if (this.x <= STATIC_VALUES.MIN_X + this.radius) {this.x = STATIC_VALUES.MIN_X + this.radius;}
		time = (this.x-this.radius-STATIC_VALUES.MIN_X) / -this.vx;
		////console.log("[vx="+this.vx+"<0]  "+this.x+" - "+this.radius+" return "+ time);
		return time;
    }
	else {
		////console.log("Else case return "+ STATIC_VALUES.INFINITE);
		return STATIC_VALUES.INFINITE;
	}
};
Sphere.prototype.TimeToHitHorizontalWall = function(){
    if (this.vy > 0) {
        // already out (possible if dt too big compare to vx)
        if (this.y >= STATIC_VALUES.MAX_Y - this.radius) {this.y = STATIC_VALUES.MAX_Y - this.radius;}
		time=(STATIC_VALUES.MAX_Y - this.radius - this.y) / this.vy;
		////console.log("[vy="+this.vy+">0]  "+this.y+" - "+this.radius+" return "+time);
		return time;
    }
	else if (this.vy < 0) {
        if (this.y <= STATIC_VALUES.MIN_Y + this.radius) {this.y = STATIC_VALUES.MIN_Y + this.radius;}
		time = (this.y - this.radius - STATIC_VALUES.MIN_Y) / -this.vy
		////console.log("[vy="+this.vy+"<0]  "+this.y+" - "+this.radius+" return "+ time);
		return time;
    }
	else {
		////console.log("Else case return "+ STATIC_VALUES.INFINITE);
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
    if (dvdr > 0) {
		return STATIC_VALUES.INFINITE;
    }
	var dvdv = dvx*dvx + dvy*dvy;
    var drdr = dx*dx + dy*dy;
    var sigma = this.radius + other.radius;
    var d = dvdr*dvdr - dvdv * (drdr - sigma*sigma);
    if (d<=0) {
		return STATIC_VALUES.INFINITE;
	}
	var time = -(dvdr + Math.sqrt(d)) / dvdv;
	
	// Compute new coord and discard out of bounds events
	var new_x = this.x + this.vx * time;
	var new_y = this.y + this.vy * time;
	if (new_x < 0 || new_x > STATIC_VALUES.MAX_X)
		return STATIC_VALUES.INFINITE;

	if (new_y < 0 || new_y > STATIC_VALUES.MAX_Y)
		return STATIC_VALUES.INFINITE;
	
	return time;
};
/**
 * Bouncing on an other particle
 * @param other
 */
Sphere.prototype.bounceOff = function(other) {
    ////console.log("Bounce off " + this + " and " + other);
    var dx = other.x - this.x;
    var dy = other.y - this.y;
    var dvx = other.vx - this.vx;
    var dvy = other.vy - this.vy;
    var dvdr = dx * dvx + dy * dvy;
    var dist = this.radius + other.radius;

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
    ////console.log("BEGIN Bouncing off vertical wall " + this);
    this.vx *= -1 ;
    this.collision++;
	////console.log("END Bouncing off vertical wall " + this+ " >>> " + this.vx);
};
Sphere.prototype.bounceOffHorizontalWall = function(){
    ////console.log("BEGIN Bouncing off horizontal wall " + this);
    this.vy *= -1 ;
    this.collision++;
	////console.log("END Bouncing off horizontal wall " + this + " >>> " + this.vy);
};
// clone with the same ID
Sphere.prototype.clone = function() {
	return new Sphere(this.radius, this.mass, this.x , this.y , this.vx , this.vy , this.r , this.g ,this.b , this.id );
};
/** tools **/
function rgb(r,g,b) {
	return "rgb("+r+","+g+","+b+")";
}
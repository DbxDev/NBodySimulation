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
		sphere1 = new Sphere(10,1,50 ,50 ,0.1,0.1,255,0  ,0);

		sphere1.Draw(context);

		var myInterval = setInterval(animate, STATIC_VALUES.DT);
		
		/** animation function **/
		function animate(){
			// TODO Compute everything
			
			// RAZ canvas
			context.clearRect(STATIC_VALUES.MIN_X_COORD+1, STATIC_VALUES.MIN_Y_COORD+1, STATIC_VALUES.MAX_X_COORD-2, STATIC_VALUES.MAX_Y_COORD-2);
			
			InitBackground(context)
			// TODO : Draw everything
			sphere1.x += STATIC_VALUES.DT * speedPixelConstant(sphere1.vx);
			sphere1.y += STATIC_VALUES.DT * speedPixelConstant(sphere1.vy);
			sphere1.Draw(context);
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
}

Sphere.prototype.Draw = function(context){
	context.fillStyle = this.color;
	context.beginPath(); 
	context.arc(this.x, this.y, this.radius, 0, Math.PI*2); // x,y,radius,starting angle, ending angle [, option clockwise]
	context.fill();
	context.closePath();
}

/** tools **/
function rgb(r,g,b) {
	return "rgb("+r+","+g+","+b+")";
}
function speedPixelConstant(speedNaturalUnit){
	return speedNaturalUnit * STATIC_VALUES.UNIT_SPACE_TO_PX / STATIC_VALUES.DT
}
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
		
		allSpheres = generateNSpheres(2000, 0.004);
		// allSpheres = generateNSpheres(200, 0.008);


       // for (var i=0 ; i< allSpheres.length ; i++ ) {
           // allSpheres[i].Draw(STATIC_VALUES.CONTEXT);
       // }

		sphere1 = new Sphere(0.1,1,0.12 ,0.12 ,0.1,0.1,255,0);

		sphere2 = new Sphere(0.1,1,0.5 ,0.12 ,-0.1,-0.1  ,0  ,255,255);
        sphere3 = new Sphere(0.1,1,0.5 ,0.5 ,-0.1,-0.1  ,0  ,255,255);
		sphere4 = new Sphere(0.1,1,0.85 ,0.15 ,-0.1,0.1  ,255,155,255);
		sphere5 = new Sphere(0.1,1,0.85 ,0.55 ,0.1,-0.1 ,0,0,255);
		spheres = new Array(sphere1, sphere2,sphere3,sphere4,sphere5);
		// console.log(spheres[0] , spheres[1]);
		// spheres = new Array(sphere1);
		CM = new CollisionManager(allSpheres);
		CM.init();
		CM.simulate()();
		
		// return;
		var count=0;
		
       // CM.resolveEvent(CM.nextEvent());
	   // var handler = setInterval(function() { 
			// CM.doNext();
		// } , STATIC_VALUES.LOGIC_LOOP_PERIOD);

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
	//this.DT = 1/200 // in s
    /** Simulation vars **/
    this.INFINITE = 999999999;
	
	/** TECHNICAL CONSTANT**/
	this.MIN_EVENTS_IN_QUEUE = 10 // number of events required to put logic process in idle state.
	this.LOGIC_IDLE_TIME = 50 // number of ms of idling >> not really satisfying.
	
	this.MAX_FPS = 60; // frames per second
	this.PERIOD_FPS = 1/this.MAX_FPS; // min time in s between to frame

	this.LOGIC_LOOP_PERIOD = this.PERIOD_FPS  // number of ms of between each logic computation.
	this.TIME_STEP = this.LOGIC_LOOP_PERIOD * 1000 * 0.5 // same as above in ms (for logic loop)
	// this.TIME_STEP = 1 // minimum value
	////console.log("Static values instanciated.")
}

function generateNSpheres(N , R) {
	var r_margin= R * 1.01 // 1% margin between 2 objects
	var D = 2 * R ;
	var d_margin = D * 1.01 ;
	var elem_on_one_line = parseInt(1/d_margin);
	var maxIndex = elem_on_one_line * elem_on_one_line;
	if (maxIndex < N) throw new Error("Impossible situation, too many or too big spheres. N="+N+" , R="+R);
	var spheres = new Array();
    var occupied = [];

    // Dense case space filled > 50% of total space
	if (maxIndex <= 2 * N) {
		for (var i=0 ; i<N ; i++) occupied[i]=true; // reservation of N values for N spheres

		// fill the rest of the array with undefined values.
		if (maxIndex > N)
			occupied[maxIndex-1] = undefined;
		
		// shuffle position.
		shuffleArray(occupied);
		
		count=0;
		for (var i=0 ; i<maxIndex ; i++) {
			if (occupied[i]) {
				vx=(1-2*Math.random())*0.3 , vy=(1-2*Math.random())*0.3;
				r = Math.floor((Math.random()*256)) , g= Math.floor((Math.random()*256)) , b = Math.floor((Math.random()*256));
				x = r_margin + d_margin*(id/elem_on_one_line>>0); // int div
				y= r_margin+d_margin*(id%elem_on_one_line); // rest
				spheres[count] = new Sphere(R,1,x , y,vx,vy,r,g,b);	
				count++;
			}
		}
	
	} else {
		var count = 0 , id;
		if (maxIndex>4000000000) throw new Error("To small radius.");
		occupied[maxIndex-1] = undefined;
		while (count<N && count<= maxIndex) {
			id=Math.floor((Math.random()*maxIndex)); // between 0 and max-1
			vx=(1-2*Math.random())*0.2 , vy=(1-2*Math.random())*0.2;
			r = Math.floor((Math.random()*256)) , g= Math.floor((Math.random()*256)) , b = Math.floor((Math.random()*256));
			while (occupied[id]) id=(id+1)%maxIndex;
			occupied[id]=true;
			
			x = r_margin + d_margin*(id/elem_on_one_line>>0); // int div
			
			// console.log("x = " + r_margin + " + " + d_margin + " * " + (id/elem_on_one_line>>0) + " = " + x );

			y= r_margin+d_margin*(id%elem_on_one_line); // rest

			// console.log("y = " + r_margin + "+" + d_margin + " * " + (id%elem_on_one_line) + " = " + y );

			spheres[count] = new Sphere(R,1,x , y,vx,vy,r,g,b);
			count++;
		}
	}
	return spheres
}
function shuffleArray( array ) {
	size = array.lengh
	for (var i=0 ; i<size ; i++ ) {
		rand = Math.floor(Math.random()*(size-i))
		tmp = array[i];
		array[i] = array[rand];
		array[rand] = tmp;
	}
}
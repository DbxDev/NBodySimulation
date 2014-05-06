var STATIC_VALUES = null;
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
    STATIC_VALUES = new StaticValues(canvas);

}

function startBrownian(N,R){
    var brownian = undefined; 
	try {
		brownian = generateBrownianSpheres(N,R);
		startSimulation(brownian);
	} catch  (e) {
		throw e;
	}
}
function startStandard(N,R){
	var allSpheres=undefined;
	try {
		allSpheres = generateNSpheres(N, R);
		startSimulation(allSpheres);
	} catch(e) {
		throw e;
	}
    
}

var CM=null;
function startSimulation(spheres){
	FPS.displayFPS(1000);
    if (CM != null) {
        CM.abort();
		var handler = setInterval(function() {
			if (CM && CM.aborted) {
				CM = buildAndStart(spheres);
				clearInterval(handler);
			}
		} , 20);
	} else {
		CM = buildAndStart(spheres);
	}
    // CM = new CollisionManager(spheres);
    // CM.init();
    // CM.simulate()();
}
function buildAndStart(spheres) {
	var CM = new CollisionManager(spheres);
	CM.init();
	CM.simulate()();
	return CM
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

	this.LOGIC_LOOP_PERIOD = this.PERIOD_FPS  // number of s of between each logic computation.
	this.TIME_STEP = this.LOGIC_LOOP_PERIOD * 1000 * 0.5 // same as above in ms (for logic loop)
	// this.TIME_STEP = 1 // minimum value

	this.TIME_LIMIT = 1000 // Events longer are discarded
}

function generateNSpheres(N , R) {
	var r_margin= R * 1.01 // 1% margin between 2 objects
	var D = 2 * R ;
	var d_margin = D * 1.01 ;
	var elem_on_one_line = parseInt(1/d_margin);
	var maxIndex = elem_on_one_line * elem_on_one_line;
	if (maxIndex < N) throw new Error("Impossible situation, too many or too big spheres.");
	var spheres = new Array();
    var occupied = [];

    // Dense case space filled > 50% of total space
    console.log("Density : " + maxIndex + " compare to " + 2*N);
	if (maxIndex <= 2 * N) {
		for (var i=0 ; i<N ; i++) occupied[i]=true; // reservation of N values for N spheres

		// fill the rest of the array with undefined values.
		if (maxIndex > N)
            for (i= N ; i< maxIndex ; i++) occupied[i] = null;
		
		// shuffle position.
        shuffleArray(occupied);
		
		count=0;
		for (var i=0 ; i<maxIndex ; i++) {
			if (occupied[i]) {
				vx=(1-2*Math.random())*0.3 , vy=(1-2*Math.random())*0.3;
				r = Math.floor((Math.random()*256)) , g= Math.floor((Math.random()*256)) , b = Math.floor((Math.random()*256));
				x = r_margin + d_margin*(i/elem_on_one_line>>0); // int div
				y= r_margin+d_margin*(i%elem_on_one_line); // rest
				spheres[count] = new Sphere(R,1,x , y,vx,vy,r,g,b,count);
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

function generateBrownianSpheres(N , R) {
    var mass=1;
    var bigOneRadiusRatio = 20;
    var r_margin= R * 1.01 // 1% margin between 2 objects
    var D = 2 * R ;
    var d_margin = D * 1.01 ;
    var elem_on_one_line = parseInt(1/d_margin);
    var maxIndex = elem_on_one_line * elem_on_one_line;
    // ( 2 * R ) ^ 2 is the number of spots occupied by the big one.
    if (maxIndex < N + 4 * bigOneRadiusRatio * bigOneRadiusRatio) throw new Error("Impossible situation, too many or too big spheres.");
    var spheres = new Array();
    var occupied = [];

    if (N > 2000) throw new Error("To many spheres. Max is 2000.");
    var count = 0 , id;
    if (maxIndex>4000000000) throw new Error("To small radius.");

    occupied[maxIndex-1]=undefined; // reservation of N values for N spheres

    // the big one
    var bigR=bigOneRadiusRatio*R;
    var bigMass=5*mass;
    var bigSphere=new Sphere(bigR ,bigMass, 0.5-bigR , 0.5-bigR , 0 , 0,0,0,0,N);

    // mid index
    var starting_index = (0.5 - bigR / d_margin>>0);
    var stop_index = (0.5+bigR / d_margin>>0);
    for (i=starting_index ; i<=stop_index ; i++) {
        for (j=starting_index ; i<=stop_index ; i++) {
            occupied[i*elem_on_one_line+j] = true;
        }
    }


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

        spheres[count] = new Sphere(R,1,x , y,vx,vy,r,g,b,count);
        count++;
    }
    spheres[N]=bigSphere;

    return spheres
}


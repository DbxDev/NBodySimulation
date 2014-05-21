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
    var spheres; 
	try {
		spheres = generateBrownianSpheres(N,R);
		startSimulation(spheres);
	} catch  (e) {
		throw e;
	}
}
function startStandard(N,R){
	var spheres;
	try {
		spheres = generateNSpheres(N, R);
		startSimulation(spheres);
	} catch(e) {
		throw e;
	}
}
function startHeatDiffusion(N,R,T_left, T_right){
	var spheres;
	try {
		spheres = generateNHeatDiffusion(N, R,T_left,T_right);
		startSimulation(spheres);
	} catch(e) {
		throw e;
	}  
}
function startGasDiffusion(N,R,V){
	var spheres;
	try {
		spheres = generateNGasDiffusion(N, R , V);
		startSimulation(spheres);
	} catch(e) {
		throw e;
	}
}

var CM=null;
function startSimulation(spheres){
	FPS.displayFPS(1000);
    if (CM != null) {
        stopSimulation(function(){
            CM = buildAndStart(spheres);
        });
    } else {
        CM = buildAndStart(spheres);
    }

}
function stopSimulation(callback){
    if (CM == null) {
        callback();
        return;
    }

    CM.abort();

    if (callback){
        var _CM = CM;
        var handler = setInterval(function() {
            if (_CM && _CM.aborted) {
                callback();
                clearInterval(handler);
            }
        } , 20);
    }
    CM = null;
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
	
	// Normalized ratio
	this.NORM_X_RATIO = (this.MAX_X_COORD - this.MIN_X_COORD)/(this.MAX_X-this.MIN_X)
	this.NORM_Y_RATIO = (this.MAX_Y_COORD - this.MIN_Y_COORD) / (this.MAX_Y-this.MIN_Y);
	
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
	
	this.ARTISTIC_MODE = true;
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
				x = r_margin + d_margin*Math.floor(i/elem_on_one_line);
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
			
			x = r_margin + d_margin*Math.floor(id/elem_on_one_line); // floor

			y= r_margin+d_margin*(id%elem_on_one_line); // rest

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

    if (N > 2000) throw new Error("Too many spheres. Max is 2000.");
    var count = 0 , id;
    if (maxIndex>4000000000) throw new Error("To small radius.");

    occupied[maxIndex-1]=undefined; // reservation of N values for N spheres

    // the big one
    var bigR=bigOneRadiusRatio*R;
    var bigMass=5*mass;
    var bigSphere=new Sphere(bigR ,bigMass, 0.5-bigR , 0.5-bigR , 0 , 0,0,0,0,N);

    // mid index
    var starting_index = Math.floor(0.5 - bigR / d_margin);
    var stop_index = Math.floor(0.5+bigR / d_margin);
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

        x = r_margin + d_margin*Math.floor(id/elem_on_one_line); // floor

        y= r_margin+d_margin*(id%elem_on_one_line); // rest

        spheres[count] = new Sphere(R,1,x , y,vx,vy,r,g,b,count);
        count++;
    }
    spheres[N]=bigSphere;

    return spheres
}

function generateNHeatDiffusion(N, R,T_left,T_right){
	var left_r=0,left_g=0,left_b=0;
	var right_r=0,right_g=0,right_b=0;
	if (T_left < T_right) {
		left_b = Math.floor(255 * T_left);
		right_r = Math.floor(255 * T_right);
	} else {
		left_r = Math.floor(255 * T_left);
		right_b = Math.floor(255 * T_right);
	}
	var v_ref = 0.3;
	var v_ref_left = v_ref * T_left / 100 ;
	var v_ref_right = v_ref * T_right / 100;
	
	var r_margin= R * 1.01 // 1% margin between 2 objects
	var D = 2 * R ;
	var d_margin = D * 1.01 ;
	var elem_on_one_line = parseInt(1/d_margin);
	var maxIndex = elem_on_one_line * elem_on_one_line;
	if (maxIndex < N) throw new Error("Impossible situation, too many or too big spheres.");
	var spheres = new Array();
	

	var halfMaxIndex = Math.floor(maxIndex/2);
	var N_left = Math.floor(N/2);
	var N_right = N - N_left;
	console.log("Left : " + N_left + " right : " + N_right);
	var currN , currVref , currR,currG,currB, x_offset , count=0;
	for (var part=0 ; part<2 ; part++) {
		if (part==0){ // Left first
			currN = N_left;
			currVref = v_ref_left;
			i_offset=0;
			currR = left_r;
			currG = left_g;
			currB = left_b;
		} else { // Then right
			currN = N_right;
			currVref = v_ref_right;
			i_offset = halfMaxIndex; // N/2 left spheres already in place
			currR = right_r;
			currG = right_g;
			currB = right_b;
		}
		var occupied = [];
		for (var i=0 ; i<currN ; i++) occupied[i]=true; // reservation of N/2 values for left spheres

		// fill the rest of the array with undefined values.
		if (halfMaxIndex > currN)
			for (i= N ; i< halfMaxIndex ; i++) occupied[i] = null;
		
		// shuffle position.
		shuffleArray(occupied);
		
		for (var i=0 ; i<halfMaxIndex ; i++) {
			if (occupied[i]) {
				realIndex =i + i_offset; // To handle the left part
				vx=(1-2*Math.random())*currVref , vy=(1-2*Math.random())*currVref;
				x = r_margin + d_margin*Math.floor(realIndex/elem_on_one_line); // floor
				y= r_margin+d_margin*(realIndex%elem_on_one_line); // rest
				spheres[count] = new Sphere(R,1,x , y,vx,vy,currR,currG,currB,count);
				count++;
			}
		}
	}
	return spheres;
}
function generateNGasDiffusion(N, R, V) {
	var r_margin= R * 1.1 // 10% of R as margin between 2 objects
	var D = 2 * R ;
	var d_margin = D * 1.01 ;
	var elem_on_one_line = parseInt(1/d_margin); // /!\ if MAX_X != 1 or MIN_X != 0 this is wrong
	var maxIndex = elem_on_one_line * elem_on_one_line;
	
	var elem_one_line_init = Math.ceil(Math.sqrt(N) * 1.1); // We put spheres in a box in the middle of the screen
	var index_margin = Math.floor((elem_on_one_line - elem_one_line_init) * 0.5);
	if (N / maxIndex > 0.8) throw new Error("Too many or too big spheres for a diffusion.");
	var spheres = new Array();
   
	for (var i=0 ; i<N ; i++) {
		vx=(1-2*Math.random())*V , vy=(1-2*Math.random())*V;
		r = Math.floor((Math.random()*256)) , g= Math.floor((Math.random()*256)) , b = Math.floor((Math.random()*256));
		x = r_margin + d_margin*(index_margin + Math.floor(i/elem_one_line_init));
		y= r_margin + d_margin*(index_margin + i%elem_one_line_init); // rest
		spheres[i] = new Sphere(R,1,x , y,vx,vy,r,g,b,i);

	}
	return spheres
}
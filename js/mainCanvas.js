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
		// var spheres = generateNSpheres(100, 0.01);
		// for (var i=0 ; i< spheres.length ; i++ ) { 
			// console.log("Sphere " + i + " : " + spheres[i]);
			// spheres[i].Draw(context);
		// }
		
		allSpheres = generateNSpheres(9000, 0.005);
        

        for (var i=0 ; i< 10 ; i++ ) {
            allSpheres[i].Draw(STATIC_VALUES.CONTEXT);
        }
		return
        // R = 0.01;
		
        // for (var i=0 ; i< 50 ; i++ ) {
           // allSpheres[i] = new Sphere(R,1,(i%8)*(2*R*1.01)+2*R ,intDiv(i,8)%8*(2*R*1.01)+2*R ,i/100,i/100,(100*i)%255,(10*i+50)%255  ,(10*i+100)%255);
// allSpheres[i] = new Sphere(R,1,(i%8)*(2*R*1.01)+2*R ,intDiv(i,8)%8*(2*R*1.01)+2*R ,0.1+0.01*i,0.001*i,(100*i)%255,(10*i+50)%255  ,(10*i+100)%255);
            // allSpheres[i].Draw(STATIC_VALUES.CONTEXT);
        // }
		sphere1 = new Sphere(0.01,1,0.6 ,0.5 ,0.1,0.1,255,0,0,0);

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
		
        sphere2 = new Sphere(0.05,1,0.2 ,0.8 ,-0.2,-0.1  ,0  ,255,0,1);
		////console.log("BEGIN Sphere 1 & 2 in CM. Infinite value set to : " + STATIC_VALUES.INFINITE);
		spheres = new Array(sphere1, sphere2);
		console.log(spheres[0] , spheres[1]);
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
		} , STATIC_VALUES.LOGIC_LOOP_PERIOD);
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
	//this.DT = 1/200 // in s
    /** Simulation vars **/
    this.INFINITE = 999999999;
	
	/** TECHNICAL CONSTANT**/
	this.MIN_EVENTS_IN_QUEUE = 30 // number of events required to put logic process in idle state.
	this.LOGIC_IDLE_TIME = 50 // number of ms of idling >> not really satisfying.
	this.LOGIC_LOOP_PERIOD = 10 // number of ms of between each logic computation.
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

function generateNSpheres(N , R) {
	var r_margin= R * 1.01 // 1% margin between 2 objects
	var D = 2 * R ;
	var d_margin = D * 1.01 ;
	var elem_on_one_line = parseInt(1/d_margin);
	var maxIndex = elem_on_one_line * elem_on_one_line;
	if (maxIndex < N) throw new Error("Impossible situation, too many or too big spheres. N="+N+" , R="+R);
	var spheres = new Array();
	
	
	// Dense case space filled > 50% of total space
	if (maxIndex <= 2 * N) {
		for (var i=0 ; i<N ; i++) occupied[i]=true; // reservation of N values for N spheres
		var occupied = []; 
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
		occupied[maxIndex-1] = undefined;
		while (count<=N && count<= maxIndex) {
			id=Math.floor((Math.random()*maxIndex)); // between 0 and max-1
			vx=(1-2*Math.random())*0.3 , vy=(1-2*Math.random())*0.3;
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
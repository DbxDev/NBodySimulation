function UniqueIDGenerator (init) {
	
	var lastID=-1;
	if (init)
		lastID = init-1;
	
	console.log("New ID Generator initialized to " + lastID);
	
	this.newId = function(){
		lastID++;
		return lastID;
	};
}

function shuffleArray( array ) {
    var size = array.length
    for (var i=0 ; i<size ; i++ ) {
        var rand = Math.floor(Math.random()*(size-i))
        var tmp = array[i];
        array[i] = array[rand];
        array[rand] = tmp;
    }
    return array;
}


function test(){
	var gen = new UniqueIDGenerator();
	for (i=0;i<5;i++)
		console.log("New ID : " + gen.newId());

	gen = new UniqueIDGenerator(7);
	for (i=0;i<3;i++)
		console.log("New shifted ID : " + gen.newId());
}


//test();
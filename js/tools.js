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

function test(){
	var gen = new UniqueIDGenerator();
	for (i=0;i<5;i++)
		console.log("New ID : " + gen.newId());

	gen = new UniqueIDGenerator(7);
	for (i=0;i<3;i++)
		console.log("New shifted ID : " + gen.newId());
}
//test();
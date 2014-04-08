function Queue() {
	this.size = 0;
	this.first = null;
	this.last = null;
}
Queue.prototype.push = function (node) {
	if (this.size == 0) {
		this.first = node;
		this.last = node;
	} else {
		this.last.next = node;
		this.last = node;
	}
	this.size++;
};
Queue.prototype.pop = function() {
	if (this.size == 0)
		return null;
	
	first = this.first;
	this.first = first.next;
	this.size--;
	return first;
};
Queue.prototype.isEmpty = function () { return this.size == 0 ;};
Queue.prototype.toString = function() {
	var result = "Queue of size "+this.size;
	var next = this.first;
	var count = 0;
	while (next) {
		result += " #"+ count + " " + next ;
		count++;
		next = next.next;
	}
	return result;
};
function Node(value){
	this.value = value;
	this.next = null;
}
Node.prototype.toString = function(){
	return "Node - " + this.value;
};

// Unit TEST
function test() {
	queue = new Queue();
	for (i=0 ; i<10 ; i++) {
		queue.push(new Node(i) );
		console.log("[push]Queue state : " + queue);
	}
	while(!queue.isEmpty()){
		console.log("[pop]Queue state : " + queue);
		console.log("dequeuing "+queue.pop());
	}
	console.log("end");
};
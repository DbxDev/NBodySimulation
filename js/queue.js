function Queue() {
	this.size = 0;
	this.first = null;
	this.last = null;
}
Queue.prototype.push = function (value) {
	node = new Node(value);
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
		throw new Error("Pop on empty queue.");
	
	var first = this.first;
	this.first = first.next;
	this.size--;
	return first.value;
};
Queue.prototype.isEmpty = function () { return this.size == 0 ;};
Queue.prototype.toString = function() {
	var result = "Queue of size "+this.size +"\n";
	var next = this.first;
	var count = 0;
	while (next) {
		result += " #"+ count + " " + next +"\n";
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
	return "[" + this.value + "]";
};

// Unit TEST
function test() {
	queue = new Queue();
	for (i=0 ; i<10 ; i++) {
		queue.push(i);
		console.log("[push]Queue state : " + queue);
	}
	var count=0;
	handler1=setInterval(function() {
		console.log("[push]Queue state : " + count);
		queue.push(count);
		count++;
		if (count > 15)
			clearInterval(handler1);
	} , 2 );
	handler2=setInterval(function() { 
	if (!queue.isEmpty()) {
		console.log("[pop]Queue state : " + queue);
		console.log("dequeuing "+queue.pop());
	} else {
		clearInterval(handler2);
	} }
	, 6 );
	
	console.log("end");
}
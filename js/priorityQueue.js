/**
 * Created by Dorian on 29/03/14.
 */
/** Priority queue **/
function PriorityQueue(){
    var that = this
    var size = 0;
    var heap = new Array();
    var root = new Key('ROOT');
    heap[0]= root;

    // Private methods
    var swim = function(i){
        console.debug("Swimming index " + i);
        while (i>1 && heap[i].compareTo(heap[i/2]) > 0){
            swap(i,i/2);
        }
        console.debug("New position " + i + "\nArray "+ that.heap);
    };
    var sink = function(i){
        console.debug("Sinking index " + i);
        while (i<=size){
            // Compare parent i and left child
            if (2*i <= size && heap[i].compareTo(heap[2*i])<0) {
                swap(i,i*2);
            }
            // Compare parent i (eventually old 2i value) with right child
            if (2*i+1 <= size && heap[i].compareTo(heap[2*i+1])<0) {
                swap(i,i*2+1);
            }
        }
        console.debug("New position " + i+ "\nArray "+ heap);
    };
    // Public methods
    var swap = function(i,j){
        old_swap = heap[i];
        heap[i] = heap[j];
        heap[j] = old_swap
    };
    /** Delete and return the max node **/
    this.DelMax = function() {
        swap(1,size); // swap with last element
        size--; // reduce
        sink(1); // sink until heap is ordered
        return heap[size+1]; // return the maximum
    };
    this.Insert = function(node) {
        size++; //extend
        heap[size] = node; // set value
        swim(size); // promote
    };
    this.IsEmpty = function() {
        return size == 0;
    };
    this.Max = function() {
        return heap[1];
    };
    this.toString = function(){
        var result = "PQ of size ["+size+"] : ";
        for (var i=0 ; i<size ; i++) {
            result += "["+i+"]="+heap[i] + " ; ";
        }
        return result;
    }
}

function Key(value) {
    var value = value;
    var that = this;
    this.getValue = function(){
        return value;
    };
    this.compareTo = function(other) {
        if (other.getValue() instanceof value) {
            if (value < other.getValue()) return -1;
            else if (value === other.getValue()) return 0;
            else return 1;
        } else {
            log.error('Comparing two different types of objects.');
        }
    };
}
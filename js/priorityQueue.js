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
		k=i
        while (k>1){
			half_k= intDiv(k,2);
			console.debug("k="+k+" : " + heap[k] + " k/2="+half_k+" " + heap[half_k]);
			
			if (heap[k].compareTo(heap[half_k]) <= 0 ) break;
			
            swap(k,half_k);
			k=half_k;
        }
        console.debug("New position " + k + "\nArray "+ heap);
    };
    var sink = function(i){
        console.debug("Sinking index " + i);
		k=i;
        while (k<=size){
            // Compare parent and both children
			//heap[k].compareTo(heap[2*k])<0
			//heap[k].compareTo(heap[2*k+1])<0
            if (2*k <= size && 2*k+1 <= size) {
				// key 2k < key 2k+1
				if (heap[2*k].compareTo(heap[2*k+1])<0) {
					// 2k+1 < k >> swap 2k+1 & k
					if (heap[k].compareTo(heap[2*k+1])<0) {
						swap(k,k*2+1);
						k = 2*k + 1;
					// 2k+1 < 2k < k >> swap 2k & k
					} else if (heap[k].compareTo(heap[2*k])<0) {
						swap(k,k*2);
						k = 2*k;
					// k > 2k+1 > 2k >> k is in place
					} else { 
						break
					}
				}
				// 2k > 2k+1 and 2k > k >> swap 2k & k
				else if (heap[k].compareTo(heap[2*k])<0) {
					swap(k,k*2);
					k = 2*k;
				// k > 2k > 2k+1 >> k is in place
				} else {
					break
				}	
			// If only one child is defined and is bigger
            } else if (2*k <= size && heap[k].compareTo(heap[2*k])<0) {
				swap(k,k*2);
				k = 2*k; 
            } else { // item is in position.
				break
			}
        }
        console.debug("New position " + k+ "\nArray "+ heap);
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
        for (var i=0 ; i<size+1; i++) {
            result += "["+i+"]="+heap[i] + " ; ";
        }
        return result;
    }
	this.printable = function(){
		result = "<div class='centered'>Heap of size "+size+" :</div>";
		i=0;
		while(i<=size) {
				result += "<div class='centered'>";
				for (var j=i+1 ; j<=2*i+1 ; j++ ) {
					if (heap[j] == undefined)
						val = formatCentered("[--]",4);
					else
						val = formatCentered(heap[j].toString(),4);
						
					result += "<div class='node'>"+val+"</div>";
				}
				result += "</div>"
			i=2*i+1;
		}
		return result;
	};
}
// Standard key with natural order.
function Key(value) {
    var value = value;
    var that = this;
    this.getValue = function(){
        return value;
    };
    this.compareTo = function(other) {
        if (typeof(other.getValue()) == typeof(value)) {
            if (value < other.getValue()) return -1;
            else if (value === other.getValue()) return 0;
            else return 1;
        } else {
            throw new Error('Comparing two different types of objects : ' + other.getValue() + ' of type '+ typeof(other.getValue()) + ' and ' + value + ' of type ' + typeof(value));
        }
    };
	this.toString = function(){
		return "[" + value +"]";
	}
}
// Reverse ordered key. This object generate a Min priority queue.
function MinKey(value) {
    var value = value;
    var that = this;
    this.getValue = function(){
        return value;
    };
    this.compareTo = function(other) {
        if (typeof(other.getValue()) == typeof(value)) {
            if (value < other.getValue()) return 1;
            else if (value === other.getValue()) return 0;
            else return -1;
        } else {
            throw new Error('Comparing two different types of objects : ' + other.getValue() + ' of type '+ typeof(other.getValue()) + ' and ' + value + ' of type ' + typeof(value));
        }
    };
	this.toString = function(){
		return "[" + value +"]";
	}
}


function intDiv(i,j){
	return i/j>>0
}
function formatCentered(entry, size) {
    var alt = true;
	var pad= '.'
	while (entry.length < size) {
		if (alt){
			entry += pad;
			alt = false;
		} else {
			entry = pad + entry;
			alt = true;
		}
    }
	return entry;
}
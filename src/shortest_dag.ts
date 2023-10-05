/** Javascript program to find single source shortest
 * paths for Directed Acyclic Graphs
*/

/** stack data structure */
class Stack<T> extends Array<T> {
	constructor(...items: T[]) {
		super()
		this.push(...items)
	}
	/** push an item to the top of the stack */
	declare push
	/** remove top item of the stack */
	declare pop
	/** view the top item of the stack */
	top(): T | undefined { return this.at(-1) }
	/** check if the stack is empty */
	isEmpty() { return this.length === 0 }
	// the size of the stack
	size(): number { return this.length }
	/** empty the stack, returning the cleared list of items */
	clear(): T[] { return this.splice(0, this.length) }
}

const INF = Number.MAX_VALUE

/** graph is represented using adjacency list.
 * every node of adjacency list contains vertex number of the vertex to which edge connects.
 * it also contains weight of the edge
*/
class AdjListNode<ID extends keyof any> {
	constructor(
		public id: ID,
		public weight: number
	) { }
}

/** represents a graph using adjacency list representation */
class Graph {
	constructor(V) {
		this.V = V // No. of vertices'
		// Pointer to an array containing adjacency lists
		this.adj = Array.from(Array(V), () => new Array())
	}

	// A function used by shortestPath
	topologicalSortUtil(v, visited, Stack) {
		// Mark the current node as visited
		visited[v] = true

		// Recur for all the vertices adjacent to this vertex

		for (let j in this.adj[v]) {
			let i = this.adj[v][j]
			let node = i
			if (!visited[node.id])
				this.topologicalSortUtil(node.id, visited, Stack)
		}

		// Push current vertex to stack which stores topological
		// sort
		Stack.push(v)
	}

	// function to add an edge to graph
	addEdge(u, v, weight) {
		let node = new AdjListNode(v, weight)
		this.adj[u].push(node) // Add v to u's list
	}

	// The function to find shortest paths from given vertex.
	// It uses recursive topologicalSortUtil() to get topological
	// sorting of given graph.
	shortestPath(s) {
		let stack = new Stack()
		let dist = new Array(this.V)

		// Mark all the vertices as not visited
		let visited = new Array(this.V)
		for (let i = 0; i < this.V; i++) {
			visited[i] = false
		}

		// Call the recursive helper function to store Topological
		// Sort starting from all vertices one by one
		for (let i = 0; i < this.V; i++)
			if (visited[i] == false)
				this.topologicalSortUtil(i, visited, stack)

		// Initialize distances to all vertices as infinite and
		// distance to source as 0
		for (let i = 0; i < this.V; i++) dist[i] = INF
		dist[s] = 0

		// Process vertices in topological order
		while (stack.isEmpty() == false) {
			// Get the next vertex from topological order
			let u = stack.top()
			stack.pop()

			// Update distances of all adjacent vertices

			if (dist[u] != INF) {
				for (let j in this.adj[u]) {
					let i = this.adj[u][j]
					if (dist[i.id] > dist[u] + i.weight)
						dist[i.id] = dist[u] + i.weight
				}
			}
		}

		// Print the calculated shortest distances
		for (let i = 0; i < this.V; i++)
			dist[i] == INF ? console.log("INF ") : console.log(dist[i] + " ")
	}
}

// Driver program to test above functions

// Create a graph given in the above diagram.
// Here vertex numbers are 0, 1, 2, 3, 4, 5 with
// following mappings: 0=r, 1=s, 2=t, 3=x, 4=y, 5=z
let g = new Graph(6)
g.addEdge(0, 1, 5)
g.addEdge(0, 2, 3)
g.addEdge(1, 3, 6)
g.addEdge(1, 2, 2)
g.addEdge(2, 4, 4)
g.addEdge(2, 5, 2)
g.addEdge(2, 3, 7)
g.addEdge(3, 4, -1)
g.addEdge(4, 5, -2)

let s = 1
console.log("Following are shortest distances from source " + s)
g.shortestPath(s);


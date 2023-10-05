
/** stack data structure */
const Stack = class <T> extends Array<T> {
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

const StackBound = class <T> extends Stack<T> {
	constructor(...items: T[]) {
		super(...items)
		const
			prop_names = ["push", "pop", "top", "isEmpty", "size", "clear"] as const,
			props = Object.fromEntries(prop_names.map((name) => {
				return [name, super[name].bind(this)]
			}))
		Object.assign(this, props)
	}
}

interface Vertex<K extends keyof any, V> {
	id: K
	data: V
}

interface DirectedEdge<K extends keyof any> {
	from: K
	to: K
}

interface AdjacentVertex<K extends keyof any> {
	id: K
	ins: Set<K>
	outs: Set<K>
}

type GraphNode<K extends keyof any, V> = Vertex<K, V> & AdjacentVertex<K>
type GraphNodeMapEntry<V> = Omit<Vertex<any, V> & AdjacentVertex<any>, "id">
type GraphNodesMap<K extends keyof any, V> = Map<K, GraphNodeMapEntry<V>>

const
	bind_factory = <T, FN extends (this: T, ...args: any[]) => any>(func: FN) => ((thisArgs: T) => func.bind(thisArgs)) as ((thisArgs: T) => FN),
	array_proto = Array.prototype,
	map_proto = Map.prototype,
	set_proto = Set.prototype,
	array_pop_bind: <T>(thisArg: Array<T>) => Array<T>["pop"] = bind_factory(array_proto.pop),
	array_push_bind: <T>(thisArg: Array<T>) => Array<T>["push"] = bind_factory(array_proto.push),
	array_at_bind: <T>(thisArg: Array<T>) => Array<T>["at"] = bind_factory(array_proto.at),
	map_get_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["get"] = bind_factory(map_proto.get),
	map_has_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["has"] = bind_factory(map_proto.has),
	map_set_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["set"] = bind_factory(map_proto.set),
	map_delete_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["delete"] = bind_factory(map_proto.delete),
	set_delete_bind: <T>(thisArg: Set<T>) => Set<T>["delete"] = bind_factory(set_proto.delete),
	set_add_bind: <T>(thisArg: Set<T>) => Set<T>["add"] = bind_factory(set_proto.add),
	set_has_bind: <T>(thisArg: Set<T>) => Set<T>["has"] = bind_factory(set_proto.has)

interface DirectedAcyclicGraph<ID extends keyof any, DATA> {
	/** all nodes inside of this graph */
	nodes: GraphNodesMap<ID, DATA>
	/** get a node. */
	get: (id: ID) => GraphNodeMapEntry<DATA>
	/** check if a node exists. */
	has: (key: ID) => boolean
	/** set the value of a node. */
	set: (key: ID, value: GraphNodeMapEntry<DATA>) => Map<ID, GraphNodeMapEntry<DATA>>
	/** delete a node from `this.nodes`, in a primitive way */
	_delete_node: (key: ID) => boolean

	/** add a node. <br>
	 * @returns `false` if a node of the same `id` already exists, else a `true` will be returned.
	*/
	add: ({ id, ...rest }: GraphNode<ID, DATA>) => boolean

	/** delete a node, and destroy (unlink) all of its adjacent connections <br>
	 * @returns `false` if a node of the provided `id` does not exist, else a `true` will be returned.
	*/
	delete: (id: ID) => boolean

	/** create a directed edge connection from a node of id `from` to a node of id `to`. <br>
	 * does not check for two way connection, which shouldn't happen in a DAG.
	 * @returns `false` if a connection already exists, else a `true` will be returned.
	*/
	link: (from: ID, to: ID) => boolean

	/** destroy a directed edge connection from a node of id `from` to a node of id `to`. <br>
	 * does not check for two way connection, which shouldn't happen in a DAG.
	 * @returns `false` if a connection did not already exists between the two nodes, else a `true` will be returned.
	*/
	unlink: (from: ID, to: ID) => boolean

	/** get a sequence of nodes ordered according to their dependency (aka topologically sorted). <br>
	 * nodes with the least amount of dependency wil come first, while those with the most dependencies will end last. <br>
	 * traversing a topologically ordered sequence of nodes guarantees you that you always previously encounter any possible dependency of the current node. <br>
	*/
	topologicalOrder: () => ID[]
}

const DirectedAcyclicGraph = class <ID extends keyof any, DATA> implements DirectedAcyclicGraph<ID, DATA> {
	nodes: GraphNodesMap<ID, DATA> = new Map()

	constructor() { }

	get = map_get_bind(this.nodes) as (id: ID) => GraphNodeMapEntry<DATA>
	has = map_has_bind(this.nodes)
	set = map_set_bind(this.nodes)
	_delete_node = map_delete_bind(this.nodes)

	add = ({ id, data, ins, outs }: GraphNode<ID, DATA>): boolean => {
		if (this.has(id)) { return false }
		this.set(id, { data, ins: new Set(ins), outs: new Set(outs) })
		return true
	}

	delete = (id: ID): boolean => {
		const { has, get, _delete_node } = this
		if (!has(id)) { return false }
		const { ins, outs } = get(id)!
		for (const from_id of ins as Set<ID>) { get(from_id)!.outs.delete(id) }
		for (const to_id of outs as Set<ID>) { get(to_id)!.ins.delete(id) }
		ins.clear()
		outs.clear()
		_delete_node(id)
		return true
	}

	link = (from: ID, to: ID): boolean => {
		const
			get = this.get,
			from_node_outs = get(from)!.outs
		if (from_node_outs.has(to)) { return false }
		from_node_outs.add(to)
		get(to)!.ins.add(from)
		return true
	}

	unlink = (from: ID, to: ID): boolean => {
		const
			get = this.get,
			from_node_outs = get(from)!.outs
		if (!from_node_outs.has(to)) { return false }
		from_node_outs.delete(to)
		get(to)!.ins.delete(from)
		return true
	}

	topologicalOrder = (source_ids?: ID[], visited_ids?: ID[]): ID[] => {
		const
			visited = new Set(visited_ids),
			has_visited = set_has_bind(visited),
			add_visited = set_add_bind(visited),
			delete_visited = set_delete_bind(visited),
			{ nodes, get } = this
		if (source_ids === undefined) {
			source_ids = []
			for (const [id, { ins }] of nodes) {
				if (ins.size === 0) { source_ids.push(id) }
			}
		}
		const recursive_dfs_visiter = (id: ID) => {
			for (const out_id of get(id).outs) {
				if (!has_visited(out_id)) {
					recursive_dfs_visiter(out_id)
				}
			}
			add_visited(id)
		}
		source_ids.forEach(recursive_dfs_visiter)
		visited_ids?.forEach(delete_visited)
		return [...visited].reverse()
	}
}

let G = new DirectedAcyclicGraph<string, never>()
G.add({ id: "A" })
G.add({ id: "B" })
G.add({ id: "C" })
G.add({ id: "D" })
G.add({ id: "E" })
G.add({ id: "F" })
G.add({ id: "G" })
G.add({ id: "H" })
G.add({ id: "I" })
G.add({ id: "J" })

G.link("A", "D"); G.link("A", "H")
G.link("B", "E")
G.link("C", "E"); G.link("C", "F")
G.link("D", "G"); G.link("D", "E")
G.link("E", "G")
G.link("F", "E"); G.link("F", "I")
G.link("G", "H")

const ordered_ids = G.topologicalOrder(["F"], ["E"])

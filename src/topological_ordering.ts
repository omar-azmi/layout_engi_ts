type MapKeyType = keyof any
type Edge<ID extends MapKeyType, FROM = ID, TO = ID> = [from: FROM, to: TO]
type VertexEdges<ID extends MapKeyType, FROM = ID, TO = ID> = Set<TO>
type GraphEdges<ID extends MapKeyType, FROM = ID, TO = ID> = Map<FROM, VertexEdges<ID, FROM, TO>>
type GetVertexEdges<ID extends MapKeyType, FROM = ID, TO = ID> = (id: FROM) => Set<TO> | undefined

const
	bind_factory = /*@__PURE__*/ <T, FN extends (this: T, ...args: any[]) => any>(func: FN, ...args: any[]) => ((thisArgs: T) => func.bind(thisArgs, ...args)) as ((thisArgs: T) => FN),
	array_proto = /*@__PURE__*/ Array.prototype,
	map_proto = /*@__PURE__*/ Map.prototype,
	set_proto = /*@__PURE__*/ Set.prototype,
	array_pop_bind: <T>(thisArg: Array<T>) => Array<T>["pop"] = /*@__PURE__*/ bind_factory(array_proto.pop),
	array_push_bind: <T>(thisArg: Array<T>) => Array<T>["push"] = /*@__PURE__*/ bind_factory(array_proto.push),
	array_splice_bind: <T>(thisArg: Array<T>) => Array<T>["splice"] = /*@__PURE__*/ bind_factory(array_proto.splice),
	array_clear_bind: <T>(thisArg: Array<T>) => Array<T>["splice"] = /*@__PURE__*/ bind_factory(array_proto.splice, 0),
	array_at_bind: <T>(thisArg: Array<T>) => Array<T>["at"] = /*@__PURE__*/ bind_factory(array_proto.at),
	stack_seek_bind: <T>(thisArg: Array<T>) => Array<T>["at"] = /*@__PURE__*/ bind_factory(array_proto.at, -1),
	map_get_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["get"] = /*@__PURE__*/ bind_factory(map_proto.get),
	map_has_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["has"] = /*@__PURE__*/ bind_factory(map_proto.has),
	map_set_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["set"] = /*@__PURE__*/ bind_factory(map_proto.set),
	map_delete_bind: <K, V>(thisArg: Map<K, V>) => Map<K, V>["delete"] = /*@__PURE__*/ bind_factory(map_proto.delete),
	set_delete_bind: <T>(thisArg: Set<T>) => Set<T>["delete"] = /*@__PURE__*/ bind_factory(set_proto.delete),
	set_add_bind: <T>(thisArg: Set<T>) => Set<T>["add"] = /*@__PURE__*/ bind_factory(set_proto.add),
	set_has_bind: <T>(thisArg: Set<T>) => Set<T>["has"] = /*@__PURE__*/ bind_factory(set_proto.has)

const
	isArray = Array.isArray,
	isEmpty = (arr: Array<any>): boolean => (arr.length === 0)

/** get the root node ids in a graph, among some collection of ids `nodes_to_consider` <br> */
const getRootNodes = <ID extends MapKeyType>(edges: GraphEdges<ID>, nodes_to_consider: Iterable<ID> = edges.keys()) => {
	const
		get_edges = map_get_bind(edges),
		root_ids = new Set<ID>(nodes_to_consider),
		delete_root_ids = set_delete_bind(root_ids)
	for (const id of root_ids) {
		// `out_id` is the name of the dependent node's id
		for (const out_id of get_edges(id) ?? []) {
			delete_root_ids(out_id)
		}
	}
	return [...root_ids]
}

/** get the inverse mapping of a graph's edges, so that if `edges` is a `Map<ID, Set<ID>>` that dictate's the outward directed edges (value `Set<ID>`) coming out of a node (key `ID`),
 * then this function will return `edges_inverse` (which is also `Map<ID, Set<ID>>`) that dictate's the inward directed edges (value `Set<ID>`) coming into a node (key `ID`)
*/
const graphEdgesInverse = <ID extends MapKeyType>(edges: GraphEdges<ID>): GraphEdges<ID> => {
	const
		edges_inverse = new Map<ID, Set<ID>>(),
		get_edges_inverse = map_get_bind(edges_inverse),
		set_edges_inverse = map_set_bind(edges_inverse)
	for (const [from_id, to_ids] of edges) {
		for (const to_id of to_ids) {
			const edge_inv = get_edges_inverse(to_id)
			if (edge_inv) { edge_inv.add(from_id) }
			else { set_edges_inverse(to_id, new Set([from_id])) }
		}
	}
	return edges_inverse
}

interface TopologicalScheduler<ID extends MapKeyType> extends Iterable<ID> {
	readonly edges: GraphEdges<ID>
	readonly stack: ID[]
	readonly fire: (...source_ids: ID[]) => void
	readonly block: (...block_ids: ID[] | never[]) => void
	readonly clear: () => void
	readonly pop: () => ID | undefined
	readonly seek: () => ID | undefined
	[Symbol.iterator](): Iterator<ID>
}

const createTopologicalScheduler = <ID extends MapKeyType>(edges: GraphEdges<ID>): TopologicalScheduler<ID> => {
	let prev_id: undefined | ID = undefined
	const
		get_edges = map_get_bind(edges),
		stack: ID[] = [],
		pop_stack = array_pop_bind(stack),
		push_stack = array_push_bind(stack),
		clear_stack = array_clear_bind(stack) as (() => Array<ID>),
		seek = stack_seek_bind(stack) as (() => ID | undefined),
		visits = new Map<ID, number>(),
		get_visits = map_get_bind(visits),
		set_visits = map_set_bind(visits),
		recursive_dfs_visiter = (id: ID) => {
			for (const out_id of get_edges(id) ?? []) {
				const visits = get_visits(out_id)
				// if the child node has been visited at least once before (`0 || undefined`), do not dfs revisit it again. just increment its counter
				if (visits) { set_visits(out_id, visits + 1) }
				else { recursive_dfs_visiter(out_id) }
			}
			set_visits(id, 1)
		},
		recursive_dfs_unvisiter = (id: ID) => {
			set_visits(id, 0)
			for (const out_id of get_edges(id) ?? []) {
				const new_visits = (get_visits(out_id) ?? 0) - 1
				if (new_visits > -1) {
					set_visits(out_id, new_visits)
					// if the child node has become unvisitable (`new_visits === 0`), then the grand-children should decrement by a visit too via recursion
					if (new_visits < 1) { recursive_dfs_unvisiter(out_id) }
				}
			}
		},
		compute_stacks_based_on_visits = () => {
			clear_stack()
			for (const [id, number_of_visits] of visits) {
				if (number_of_visits > 0) { push_stack(id) }
			}
		},
		pop = () => {
			prev_id = pop_stack()
			if (prev_id !== undefined) { set_visits(prev_id, 0) }
			return prev_id
		}

	return {
		edges,
		stack,
		seek,
		pop,
		*[Symbol.iterator]() {
			prev_id = pop()
			while (prev_id !== undefined) {
				yield prev_id
				prev_id = pop()
			}
		},
		fire: (...source_ids: ID[]) => {
			visits.clear()
			source_ids.forEach(recursive_dfs_visiter)
			compute_stacks_based_on_visits()
		},
		block: (...block_ids: ID[] | never[]) => {
			if (isEmpty(block_ids) && prev_id !== undefined) {
				block_ids.push(prev_id as never)
			}
			block_ids.forEach(recursive_dfs_unvisiter)
			compute_stacks_based_on_visits()
		},
		clear: () => {
			visits.clear()
			clear_stack()
		},
	}
}

interface TopologicalAsyncScheduler<ID extends MapKeyType> {
	readonly edges: GraphEdges<ID>
	readonly pending: Set<ID>
	readonly resolve: (...ids: ID[]) => ID[]
	readonly reject: (...ids: ID[]) => ID[]
	readonly fire: (...source_ids: ID[]) => void
	readonly clear: () => void
}

const createTopologicalAsyncScheduler = <ID extends MapKeyType>(edges: GraphEdges<ID>): TopologicalAsyncScheduler<ID> => {
	const
		get_edges = map_get_bind(edges),
		pending = new Set<ID>(),
		add_pending = set_add_bind(pending),
		has_pending = set_has_bind(pending),
		delete_pending = set_delete_bind(pending),
		ins_count = new Map<ID, number>(),
		get_ins_count = map_get_bind(ins_count),
		set_ins_count = map_set_bind(ins_count),
		compute_ins_count = () => {
			ins_count.clear()
			for (const [id, in_ids] of edges) {
				set_ins_count(id, in_ids.size)
			}
		},
		clear = () => {
			pending.clear()
			compute_ins_count()
		},
		fire = (...source_ids: ID[]) => {
			clear()
			for (const id of source_ids) { add_pending(id) }
		},
		resolve = (...ids: ID[]): ID[] => {
			const next_ids: ID[] = []
			for (const id of ids) {
				if (has_pending(id)) {
					delete_pending(id)
					get_ins_count
				}
			}
		}
		edges.
}


const S = <T>(...items: T[]) => new Set<T>(items)

const nodes: GraphEdges<string> = new Map([
	["A", S("D", "H")],
	["B", S("E")],
	["C", S("E", "F")],
	["D", S("E", "G")],
	["E", S("G")],
	["F", S("E", "I")],
	["G", S("H")],
])
const top_traversal = createTopologicalScheduler(nodes)
top_traversal.fire("C")
console.log(top_traversal.pop())
console.log(top_traversal.pop())
top_traversal.block()
console.log(...top_traversal)

/*
nodes.get("B")?.add("J")
nodes.get("C")?.add("J")
nodes.get("E")?.add("J")
console.log(top_traversal())
*/


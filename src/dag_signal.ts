// deno-lint-ignore-file no-inferrable-types
const enum NODE_TYPE {
	STATE = 0,
	LAZY = 1,
	MEMO = 2,
	EFFECT = 3,
}
const NODE_TYPE_LEN = 4 as const
type StateID = NODE_TYPE.STATE | number
type LazyID = NODE_TYPE.LAZY | number
type MemoID = NODE_TYPE.MEMO | number
type EffectID = NODE_TYPE.EFFECT | number
type SignalerID = StateID | LazyID | MemoID
type ObserverID = LazyID | MemoID | EffectID
type NodeID = SignalerID | ObserverID

type Accessor<T> = (observer_id?: ObserverID) => T
type Setter<T> = (value: T) => void
type Runner = () => void
type AccessorSetter<T> = [Accessor<T>, Setter<T>]
export type LazyFn<T> = (observer_id?: ObserverID) => T
export type MemoFn<T> = (observer_id?: ObserverID) => T
export type EffectFn = (observer_id?: ObserverID) => void

type NormalFloat = number

/** type definition for a value equality check function. */
export type EqualityFn<T> = (prev_value: T | undefined, new_value: T) => NormalFloat

/** type definition for an equality check specification. <br>
 * when `undefined`, javascript's regular `===` equality will be used. <br>
 * when `false`, equality will always be evaluated to false, meaning that setting any value will always fire a signal, even if it's equal.
*/
export type EqualityCheck<T> = undefined | false | EqualityFn<T>

interface Node<GT, ST> {
	/** id of the node */
	id: NodeID
	/** first run id of the node, then it becomes `0` after the first run */
	rid: NodeID | 0
	/** count of total dependencies (not just the immediate). this value is also used for figuring out the topological ordering position of this node in the scheduled list of nodes to run. */
	total_deps: number
	/** immediate dependancy signal nodes. once a node is settled, this property is destroyed because it is no longer needed. */
	deps?: Set<SignalerID>
	/** immediate observer nodes */
	obvs: ObserverID[]
	/* subtypes must implement a get value function */
	getValue: Accessor<GT>
	/* subtypes must implement a set value function, in addition to propagating their signal if they deem necessary */
	setValue: Setter<ST>
	/** subtypes must implement a run reactions function to propagate their signal */
	runReaction: Runner
	// optional properties based on subtype's specific requirements
	fn?: LazyFn<GT> | MemoFn<GT> | EffectFn
	value?: GT
	equals?: EqualityFn<GT>
	dirty?: boolean
}
interface State<T> extends Omit<Node<T, T>, "fn" | "dirty"> {
	id: StateID
	value: T
	equals: EqualityFn<T>
}
interface Lazy<T> extends Omit<Node<T, never>, "equals"> {
	id: LazyID
	fn: LazyFn<T>
	value?: T
	dirty: boolean
}
interface Memo<T> extends Omit<Node<T, never>, "dirty"> {
	id: MemoID
	fn: MemoFn<T>
	value?: T
	equals: EqualityFn<T>
}
interface Effect extends Omit<Node<void, never>, "value" | "equals" | "dirty"> {
	id: EffectID
	fn: EffectFn
}
type SignalerNode<T> = State<T> | Lazy<T> | Memo<T>
type ObserverNode<T> = Lazy<T> | Memo<T> | Effect

/** represents options when creating a state via {@link createState}. */
export interface CreateStateOptions<T> {
	/** when a state's value is updated through a {@link Setter}, then the observers/dependants of
	 * THIS state will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>
}

/** represents options when creating a lazy computation via {@link createLazy}. */
export interface CreateLazyOptions<T> { }

/** represents options when creating a memo via {@link createMemo}. */
export interface CreateMemoOptions<T> {
	/** when a memo's value is updated through a notification by its one of its dependancy signal,
	 * then the observers/dependants of THIS memo will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>
	/** specify initial value for {@link equals} to use when doing the very first comparison of equality. */
	value?: T
	defer?: boolean
}

/** represents options when creating an effect node via {@link createEffect}. */
export interface CreateEffectOptions {
	/** when `true`, the effect function {@link EffectFn} will not be run immediately (ie the first execution will be skipped),
	 * and its execution will be put off until one of its dependancy signal notifies of an updated value. <br>
	 * by default, `defer` is `false`, and effects are immediately executed during initialization. <br>
	 * the reason why you might want to defer an effect is because the body of the effect function may contain symbols/variables
	 * that have not been defined yet, in which case an error will be raised, unless you choose to defer the first execution. <br>
	*/
	defer?: boolean
}

const
	default_equality = (<T>(v1: T, v2: T) => +(v1 === v2)) satisfies EqualityFn<any>,
	falsey_equality = (<T>(v1: T, v2: T) => 0) satisfies EqualityFn<any>,
	default_compareFn = <A, B>(a: A, b: B) => ((a as number) - (b as number)),
	node_total_deps_compareFn = (node: Node<any, any>, total_deps: Node<any, any>["total_deps"]) => (node.total_deps - total_deps),
	isStateID = (id: NodeID): id is NODE_TYPE.STATE => (id % NODE_TYPE_LEN === 0),
	isLazyID = (id: NodeID): id is NODE_TYPE.LAZY => (id % NODE_TYPE_LEN === 1),
	isMemoID = (id: NodeID): id is NODE_TYPE.MEMO => (id % NODE_TYPE_LEN === 2),
	isEffectID = (id: NodeID): id is NODE_TYPE.EFFECT => (id % NODE_TYPE_LEN === 3),
	isSignalerID = (id: NodeID): id is (NODE_TYPE.STATE | NODE_TYPE.LAZY | NODE_TYPE.MEMO) => (id % NODE_TYPE_LEN < 3),
	isObserverID = (id: NodeID): id is (NODE_TYPE.LAZY | NODE_TYPE.MEMO | NODE_TYPE.EFFECT) => (id % NODE_TYPE_LEN > 0),
	/** binary search for the insertion index of `value` in an already sorted array `arr` */
	binarySearchIndex = <A, B>(
		arr: A[],
		value: B,
		compareFn: ((a: A, b: B) => number) = default_compareFn,
		start: number = 0,
		end: number = arr.length - 1,
	) => {
		while (start <= end) {
			const
				mid = ((start + end) / 2) | 0,
				greater_by = compareFn(arr[mid], value)
			if (greater_by < 0) { start = mid + 1 }
			else if (greater_by > 0) { end = mid - 1 }
			else { return mid + 1 }
		}
		return start
	},
	binaryInsert = <A, B>(
		arr: A[],
		insert_value: A,
		compare_value: B,
		compareFn: ((a: A, b: B) => number) = default_compareFn,
		start?: number,
		end?: number
	) => {
		arr.splice(binarySearchIndex(
			arr, compare_value, compareFn, start, end,
		), 0, insert_value)
	}


const createContext = () => {
	// we don't initiate `id_counter` with `-NODE_TYPE_LEN`, so that the first created state node gets an id of `4`, rather than `0`.
	// this is because doing so minaturizes the obeserver id comparison step from: `if (oberver_id !== undefined)` to `if(observer_id)`.
	let id_counter: StateID = 0
	const
		increment_id_counter = (): number => (id_counter += NODE_TYPE_LEN),
		topological_order: Node<any, any>[] = [],
		all_nodes: Map<NodeID, Node<any, any>> = new Map(),
		search_node_id = <T extends Node<any, any>>(node_id: NodeID): T => (all_nodes.get(node_id) as T),
		node_id_total_deps_compareFn = (node_id: Node<any, any>["id"], node_total_deps: Node<any, any>["total_deps"]) => (search_node_id(node_id).total_deps - node_total_deps)

	const NodeInfo = class <GT, ST> implements Node<GT, ST>{
		rid: NodeID | 0
		total_deps: number = 0
		deps?: Set<SignalerID> = new Set()
		obvs: ObserverID[] = []
		/* subtypes must implement a get value function */
		declare getValue: (observer_id?: ObserverID | 0) => GT
		/* subtypes must implement a set value function, in addition to propagating their signal if they deem necessary */
		declare setValue: (value: ST) => void
		declare runReaction: Runner

		constructor(
			/** id of the node */
			public id: NodeID
		) {
			all_nodes.set(id, this)
			this.rid = id
		}

		/** notify an observer that it is observing `this`, and therefore must add `this.id` into its list of dependecy signals (`observer.deps`) */
		notify_observer(observer_id: ObserverID) {
			search_node_id(observer_id)!.deps!.add(this.id)
		}

		/** settle this node after first run execution.
		 * ie finalize its dependecies `deps` and its total dependency count `total_deps`, and mutate its first run id `rid`.
		 * finally, register it to {@link topological_order} scheduler at the appropriate position.
		*/
		settle() {
			const
				signalers = [...this.deps!].map(search_node_id),
				// add each signaler's total dependency count to this node's total dependency count, plus one
				total_deps = signalers.reduce((total, signaler) => (total + signaler.total_deps + 1), 0),
				id = this.id
			for (const signaler of signalers) {
				// for each dependancy `signaler` node:
				// insert `this.id` to signaler's list of observers (`signaler.obvs`) so that it maintains the
				// topological order sorting (based on their `total_deps`)
				binaryInsert(signaler.obvs, id, total_deps, node_id_total_deps_compareFn)
			}
			binaryInsert(topological_order, this, total_deps, node_total_deps_compareFn)
			this.total_deps = total_deps
			// no more signaler nodes will ever register this node after we set `rid` to `0`
			this.rid = 0
			// we also clean up `this.deps`, because it will no longer be ever needed
			this.deps = undefined
		}
	}










	const
		// the observers (values) of each signaler node (keys).
		// the observers' ids are guaranteed to be sorted in the order of their scheduled execution (as defined by `scheduled_observers`)
		signal_observers: Map<SignalerID, ObserverID[]> = new Map(),
		// the dependency signals (values) of each observer node (keys).
		// this is kind of a reverse mapping of `signal_observers`
		observer_dependencies: Map<ObserverID, SignalerID[]> = new Map(),
		// scheduled nodes are ordered according to their topological ordering (look it up on wikipedia).
		// meaning that that when traversing `scheduled_observers`, you are guaranteed to have always previously encountered any dependency of the current node id.
		scheduled_observers: ObserverID[] = [],
		// sets maintain the order of insertion when iterated,
		// which is a property that we need for the reactions to run based on their scheduled order.
		queued_reruns: Set<ObserverID> = new Set()

	/** add a new observer to the scheduler `scheduled_observers` at the appropriate index location,
	 * such that all of its dependency signals come before it in the schedule.
	*/
	const schedule_new_observer = (id: ObserverID) => {
		const
			// we are only interested in dependencies that too can have other dependencies,
			// thus state kind dependencies don't matter for the scheduler,
			// because they themselves are always executed dependency free
			nonstate_dependencies: Set<ObserverID> = new Set(
				observer_dependencies.get(id)!.filter(isObserverID)
			),
			len = scheduled_observers.length
		// the index at which our `id` will be inserted into the scheduler after the for loop
		// effect type nodes cannot have observers in the future, thus we need only to insert it to the end of the scheduler list
		let insertion_index = isEffectID(id) ? len : 0
		// what the loop does: keep traversing `scheduled_observers` until all dependancies have been encounter.
		// after which, we would know where exactly to insert our `id` to
		for (; nonstate_dependencies.size > 0 && insertion_index < len; insertion_index++) {
			const node_id = scheduled_observers[insertion_index]
			if (nonstate_dependencies.has(node_id)) {
				nonstate_dependencies.delete(node_id)
			}
		}
		scheduled_observers.splice(insertion_index, 0, id)
	}

	const register_observer_to_signal = (signal_id: SignalerID, observer_id?: ObserverID) => {
		if (observer_id) {
			observer_dependencies.get(observer_id)!.push(signal_id)
			signal_observers.get(signal_id)!.push(observer_id)
		}
	}

	const add_its_observers_to_rerun_queue = (signaler_id: SignalerID) => {
		for (const observer_id of signal_observers.get(signaler_id)!) {
			queued_reruns.delete(observer_id)
			queued_reruns.add(observer_id)
		}
	}

	const rerun_reactions = () => {
		for (const observer_id of queued_reruns) {
			(all_nodes.get(observer_id)! as ObserverNode<any>).run()
		}
		queued_reruns.clear()
	}

	const State = class <T> implements State<T>{
		equals: EqualityFn<T>

		constructor(
			public id: StateID,
			public value: T,
			equals?: EqualityCheck<T>,
		) {
			this.equals = (equals ?? default_equality) || falsey_equality
		}

		/** sets `this.value`, then queue's its observers to run if the new value does not equal to the old value */
		set: Setter<T> = (value) => {
			if (this.equals(this.value, value) < 0.5) {
				this.value = value
				add_its_observers_to_rerun_queue(this.id)
				rerun_reactions()
			}
		}

		get: Accessor<T> = (observer_id) => {
			register_observer_to_signal(this.id, observer_id)
			return this.value
		}
	}

	const Lazy = class <T> implements Lazy<T>{
		value?: T
		dirty: boolean
		rid: 0 | LazyID

		constructor(
			public id: LazyID,
			public fn: LazyFn<T>,
		) {
			this.dirty = true
			this.rid = id
		}

		/** becomes dirty, and queues its observers to rerun */
		run() {
			this.dirty = true
			add_its_observers_to_rerun_queue(this.id)
		}

		get: Accessor<T> = (observer_id) => {
			const rid = this.rid
			register_observer_to_signal(this.id, observer_id)
			if (this.dirty) {
				this.value = this.fn(rid)
				if (rid) { schedule_new_observer(rid) }
				this.dirty = false
				// destoy `this.rid`, because there's no longer a need to notify this effects's dependancy
				// signals inside of `this.fn`, since they've been notified before (in the `this.fn(this.rid)` line)
				this.rid = 0
			}
			return this.value!
		}
	}

	const Memo = class <T> implements Memo<T>{
		equals: EqualityFn<T>
		rid: 0 | MemoID

		constructor(
			public id: MemoID,
			public fn: MemoFn<T>,
			public value?: T,
			equals?: EqualityCheck<T>,
		) {
			this.equals = (equals ?? default_equality) || falsey_equality
			this.rid = id
			queued_reruns.add(id)
		}

		/** updates `this.value`, then queue's its observers to run if the new value does not equal to the old value */
		run() {
			const
				rid = this.rid,
				value = this.fn(rid)
			if (rid) { schedule_new_observer(rid) }
			// destoy `this.rid`, because there's no longer a need to notify this effects's dependancy
			// signals inside of `this.fn`, since they've been notified before (in the `this.fn(this.rid)` line)
			this.rid = 0
			// only notify observers if the value has changed
			if (this.equals(this.value, value) < 0.5) {
				this.value = value
				add_its_observers_to_rerun_queue(this.id)
			}
		}

		get: Accessor<T> = (observer_id) => {
			register_observer_to_signal(this.id, observer_id)
			return this.value!
		}
	}

	const Effect = class implements Effect {
		rid: 0 | EffectID

		constructor(
			public id: EffectID,
			public fn: EffectFn,
		) {
			this.rid = id
			queued_reruns.add(id)
		}

		/** runs the effect */
		run: Runner = () => {
			const rid = this.rid
			this.fn(rid)
			if (rid) { schedule_new_observer(rid) }
			// destoy `this.rid`, because there's no longer a need to notify this effects's dependancy
			// signals inside of `this.fn`, since they've been notified before (in the `this.fn(this.rid)` line)
			this.rid = 0
		}
	}

	const createState = <T>(initial_value: T, { equals }: CreateStateOptions<T> = {}): AccessorSetter<T> => {
		const
			id: StateID = increment_id_counter(),
			state = new State<T>(id, initial_value, equals)
		all_nodes.set(id, state)
		signal_observers.set(id, [])
		return [state.get, state.set]
	}

	const createLazy = <T>(fn: LazyFn<T>, options?: CreateLazyOptions<T>): Accessor<T> => {
		const
			id: LazyID = increment_id_counter() + 1,
			lazy = new Lazy<T>(id, fn)
		all_nodes.set(id, lazy)
		signal_observers.set(id, [])
		observer_dependencies.set(id, [])
		return lazy.get
	}

	const createMemo = <T>(fn: MemoFn<T>, { value, equals, defer = true }: CreateMemoOptions<T> = {}): Accessor<T> => {
		const
			id: MemoID = increment_id_counter() + 2,
			memo = new Memo<T>(id, fn, value, equals)
		all_nodes.set(id, memo)
		signal_observers.set(id, [])
		observer_dependencies.set(id, [])
		if (!defer) { memo.run() }
		return memo.get
	}

	const createEffect = (fn: EffectFn, { defer = true }: CreateEffectOptions = {}): Runner => {
		const
			id: EffectID = increment_id_counter() + 3,
			effect = new Effect(id, fn)
		all_nodes.set(id, effect)
		observer_dependencies.set(id, [])
		if (!defer) { effect.run() }
		return effect.run
	}

	return { createState, createLazy, createMemo, createEffect, rerun_reactions, all_nodes, signal_observers, observer_dependencies, scheduled_observers }
}

/** run_observer should:
 * - State: do nothing
 * - Lazy:
 *   - become dirty
 *   - queue run_observer for observers `queue_reactions(lazy_id)`
 * - Memo:
 *   - run update
 *   - queue run_observer for observers `queue_reactions(memo_id)`
 * - Memo:
 *   - run update
*/



//test
const { createState, createLazy, createMemo, createEffect, rerun_reactions, all_nodes, observer_dependencies, scheduled_observers, signal_observers } = createContext()
const [s1, setS1] = createState<number>(1)
const [s2, setS2] = createState<number>(2)

const l1 = createLazy((id) => s1(id) * 2)
const l2 = createLazy((id) => s2(id) + l1(id))

const m1 = createMemo((id) => s1(id) * 2)
const m2 = createMemo((id) => s2(id) + l1(id))

const e1 = createEffect((id) => {
	console.log(`I seek s1 and l2: ${s1(id)}, ${l2(id)}`)
	console.log(`I seek m1 and m2: ${m1(id)}, ${m2(id)}`)
})

setS1(3)

/*
const mid = (base: number) => (base * NODE_TYPE_LEN + 2)
schedule_new_observer(mid(0), [])
schedule_new_observer(mid(1), [mid(0)])
schedule_new_observer(mid(3), [mid(0)])
schedule_new_observer(mid(2), [mid(1), mid(3)])
schedule_new_observer(mid(4), [mid(2)])

console.log(scheduled_observers.map((v) => (v - 2) / NODE_TYPE_LEN))
*/


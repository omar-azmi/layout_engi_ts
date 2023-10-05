// what a terrible idea...

type SignalID = number // `SignalID % 4 = 0`
type ComputedID = number // `ComputedID % 4 = 1`
type MemoID = number // `MemoID % 4 = 2`
type EffectID = number // `EffectID % 4 = 3`
type ObserverID = ComputedID | MemoID | EffectID
type Accessor<T> = (observer_id?: ObserverID) => T
type Setter<T> = (value: T) => void
type Runner = () => void
type AccessorSetter<T> = [Accessor<T>, Setter<T>]
type ComputedFn<T> = (observer_id?: ObserverID) => T
type MemoFn<T> = (observer_id?: ObserverID) => T
type EffectFn = (observer_id?: ObserverID) => void
type ObserverFn<T> = ComputedFn<T> | MemoFn<T> | EffectFn
type Observer<T> = Computed<T> | Memo<T> | Effect

/** type definition for a value equality check function. */
export type EqualityFn<T> = (prev_value: T | undefined, new_value: T) => boolean

/** type definition for an equality check specification. <br>
 * when `undefined`, javascript's regular `===` equality will be used. <br>
 * when `false`, equality will always be evaluated to false, meaning that setting any value will always fire a signal, even if it's equal.
*/
export type EqualityCheck<T> = undefined | false | EqualityFn<T>

const ID = Symbol()
const OBSERVERS = Symbol()
const VALUE = Symbol()
const EQUALS = Symbol()
const SET = Symbol()
const GET = Symbol()
const RUN = Symbol()
const FN = Symbol()
const DIRTY = Symbol()

export interface Signal<T> {
	[OBSERVERS]: Set<ObserverID>
	[VALUE]: T
	[EQUALS]: EqualityFn<T>
	[SET]: Setter<T>
	[GET]: Accessor<T>
}

/** represents options when creating a signal via {@link createSignal}. */
export interface CreateSignalOptions<T> {
	/** when a signal's value is updated through a {@link Setter}, then the observers/dependants of
	 * THIS signal will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>
}

export interface Computed<T> {
	[FN]: ComputedFn<T>
	[DIRTY]: boolean
	[OBSERVERS]: Set<ObserverID>
	[VALUE]?: T
	[ID]?: ComputedID
	[GET]: Accessor<T>
}

/** represents options when creating a computed via {@link createComputed}. */
export interface CreateComputedOptions<T> { }


export interface Memo<T> {
	[FN]: MemoFn<T>
	[OBSERVERS]: Set<ObserverID>
	[VALUE]?: T
	[ID]?: MemoID
	[EQUALS]: EqualityFn<T>
	[RUN]: Runner
	[GET]: Accessor<T>
}

/** represents options when creating a memo via {@link createMemo}. */
export interface CreateMemoOptions<T> {
	/** when a memo's value is updated through a notification by its one of its dependancy `Signal`s, `Memo`s, or `Computed`s,
	 * then the observers/dependants of THIS memo will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>
	/** specify initial value for {@link equals} to use when doing the very first comparison of equality. */
	value?: T
	defer?: boolean
}

export interface Effect {
	[FN]: EffectFn
	[ID]?: EffectID
	[RUN]: Runner
}

/** represents options when creating an effect signal via {@link createEffect}. */
export interface CreateEffectOptions {
	/** when `true`, the effect function {@link EffectFn} will not be run immediately (ie the first execution will be skipped),
	 * and its execution will be put off until one of its dependancy `Signal`'s, `Memo`'s, or `Computed`'s value is updated. <br>
	 * by default, `defer` is `false`, and effects are immediately executed during initialization. <br>
	 * the reason why you might want to defer an effect is because the body of the effect function may contain symbols/variables
	 * that have not been defined yet, in which case an error will be raised, unless you choose to defer the first execution. <br>
	*/
	defer?: boolean
}

let get_counter = 0, computed_counter = 0, memo_counter = 0, effect_counter = 0

const default_equality = (<T>(v1: T, v2: T) => (v1 === v2)) satisfies EqualityFn<any>
const falsey_equality = (<T>(v1: T, v2: T) => false) satisfies EqualityFn<any>

const createContext = () => {
	let id_counter: SignalID = 0
	const
		all_observers: Map<ObserverID, Observer<any>> = new Map(),
		queued_rerun_ids: Array<Set<MemoID | EffectID>> = [],
		increment_id_counter = () => { id_counter += 4 }

	/** notify a set of observers of a change in a dependancy's value.
	 * - a `Computed` observer will become `dirty`
	 * - a `Memo` observer will be queued to rerun.
	 *   during its rerun, if the memo's new value does not equal to its old value,
	 *   then it will notify its own observers
	 * - an `Effect` observer will be queued to rerun
	*/
	const notify = (observers: Set<ObserverID>, rerun_ids: Set<MemoID | EffectID> = new Set()): typeof rerun_ids => {
		for (const id of observers) {
			if (id % 4 === 1) {
				// `id` is `ComputedID`
				const obv = all_observers.get(id)! as Computed<any>
				if (!obv[DIRTY]) {
					obv[DIRTY] = true
					notify(obv[OBSERVERS], rerun_ids)
				}
			} else {
				// `id` is `MemoID` or `EffectID`
				rerun_ids.add(id)
			}
		}
		return rerun_ids
	}

	const add_rerun_id = (id: MemoID | EffectID) => {
		queued_rerun_ids.push((queued_rerun_ids.pop() ?? new Set()).add(id))
	}

	const rerun_memos_and_effects = () => {
		// do a breadth-first-search (BFS) of the queued ids of memos and effects that need to be rerun.
		// the recursion will first clear the bottom of the queued `rerun_ids = queued_rerun_ids.shift()`,
		// and then any consequent set of ids added to `queued_rerun_ids` as a side effect of this round of
		// runs, will be run in the next recursion of `rerun_memos_and_effects()`, and so on. 
		let rerun_ids: Set<number> | undefined
		while (rerun_ids = queued_rerun_ids.shift()) {
			for (const id of rerun_ids) {
				(all_observers.get(id) as Memo<any> | Effect)[RUN]()
			}
		}
	}

	const Signal = class <T> implements Signal<T>{
		[OBSERVERS]: Set<ObserverID> = new Set();
		[EQUALS]: EqualityFn<T>
		[VALUE]: T

		constructor(
			value: T,
			equals?: EqualityCheck<T>,
		) {
			this[VALUE] = value
			this[EQUALS] = equals === false ? falsey_equality : (equals ?? default_equality)
		}

		[SET]: Setter<T> = (value) => {
			if (this[EQUALS](this[VALUE], value)) { return }
			this[VALUE] = value
			queued_rerun_ids.push(notify(this[OBSERVERS]))
			rerun_memos_and_effects()
		}

		[GET]: Accessor<T> = (observer_id) => {
			get_counter++
			if (observer_id) { this[OBSERVERS].add(observer_id) }
			return this[VALUE]
		}
	}

	const Computed = class <T> implements Computed<T>{
		[OBSERVERS]: Set<ObserverID> = new Set();
		[VALUE]?: T
		[DIRTY]: boolean
		[FN]: ComputedFn<T>
		[ID]?: ComputedID

		constructor(
			fn: ComputedFn<T>,
			id?: ComputedID,
		) {
			this[FN] = fn
			this[ID] = id
			this[DIRTY] = true
		}

		[GET]: Accessor<T> = (observer_id) => {
			if (observer_id) { this[OBSERVERS].add(observer_id) }
			if (this[DIRTY]) {
				computed_counter++
				this[VALUE] = this[FN](this[ID])
				this[DIRTY] = false
				// destoy `this.id`, because there's no longer a need to notify this computed's dependancy memos, computeds,
				// and signals inside of `this.fn`, since they've been notified before (in the `this.value = this.fn(this.id)` line)
				this[ID] = undefined
			}
			return this[VALUE]!
		}
	}

	const Memo = class <T> implements Memo<T>{
		[OBSERVERS]: Set<ObserverID> = new Set();
		[EQUALS]: EqualityFn<T>
		[FN]: MemoFn<T>
		[ID]?: MemoID
		[VALUE]?: T

		constructor(
			fn: MemoFn<T>,
			id?: MemoID,
			value?: T,
			equals?: EqualityCheck<T>,
		) {
			this[FN] = fn
			this[ID] = id
			this[VALUE] = value
			this[EQUALS] = equals === false ? falsey_equality : (equals ?? default_equality)
			add_rerun_id(id!)
		}

		[RUN]: Runner = () => {
			memo_counter++
			const value = this[FN](this[ID])
			// destoy `this.id`, because there's no longer a need to notify this memo's dependancy memos, computeds,
			// and signals inside of `this.fn`, since they've been notified before (in the `this.value = this.fn(this.id)` line)
			this[ID] = undefined
			// only notify observers if the value has changed
			if (this[EQUALS](this[VALUE], value)) { return }
			this[VALUE] = value
			queued_rerun_ids.push(notify(this[OBSERVERS]))
			rerun_memos_and_effects()
		}

		[GET]: Accessor<T> = (observer_id) => {
			if (observer_id) { this[OBSERVERS].add(observer_id) }
			return this[VALUE]!
		}
	}

	const Effect = class implements Effect {
		[FN]: EffectFn
		[ID]?: EffectID

		constructor(
			fn: EffectFn,
			id?: EffectID,
		) {
			this[FN] = fn
			this[ID] = id
			add_rerun_id(id!)
		}

		[RUN]: Runner = () => {
			effect_counter++
			this[FN](this[ID])
			// destoy `this.id`, because there's no longer a need to notify this effects's dependancy memos, computeds,
			// and signals inside of `this.fn`, since they've been notified before (in the `this.fn(this.id)` line)
			this[ID] = undefined
		}
	}

	const createSignal = <T>(initial_value: T, { equals }: CreateSignalOptions<T> = {}): AccessorSetter<T> => {
		const signal = new Signal<T>(initial_value, equals)
		return [signal[GET], signal[SET]]
	}

	const createComputed = <T>(fn: ComputedFn<T>, options?: CreateComputedOptions<T>): Accessor<T> => {
		const
			computed_id: ComputedID = id_counter + 1,
			computed = new Computed<T>(fn, computed_id)
		all_observers.set(computed_id, computed)
		increment_id_counter()
		return computed[GET]
	}

	const createMemo = <T>(fn: MemoFn<T>, { value, equals, defer = true }: CreateMemoOptions<T> = {}): Accessor<T> => {
		const
			memo_id: MemoID = id_counter + 2,
			memo = new Memo<T>(fn, memo_id, value, equals)
		all_observers.set(memo_id, memo)
		increment_id_counter()
		if (!defer) { memo[RUN]() }
		return memo[GET]
	}

	const createEffect = (fn: EffectFn, { defer = true }: CreateEffectOptions = {}): Runner => {
		const
			effect_id: EffectID = id_counter + 3,
			effect = new Effect(fn, effect_id)
		all_observers.set(effect_id, effect)
		increment_id_counter()
		if (!defer) { effect[RUN]() }
		return effect[RUN]
	}

	return { createSignal, createComputed, createMemo, createEffect }
}


// Example usage
const { createSignal, createComputed, createMemo, createEffect } = createContext()

const [s1, setS1] = createSignal<number>(1)
const [s2, setS2] = createSignal<number>(2)

const c1 = createComputed((id) => s1(id) * 2)
const c2 = createComputed((id) => s2(id) + c1(id))

const m1 = createMemo((id) => s1(id) * 2)
const m2 = createMemo((id) => s2(id) + c1(id))

const e1 = createEffect((id) => {
	console.log(`I seek s1 and c2: ${s1(id)}, ${c2(id)}`)
	console.log(`I seek m1 and m2: ${m1(id)}, ${m2(id)}`)
})

console.log(get_counter, computed_counter, memo_counter, effect_counter)
console.log(c2()) // Should output 0, as it's not computed yet
console.log(get_counter, computed_counter, memo_counter, effect_counter)
setS1(3)
console.log(get_counter, computed_counter, memo_counter, effect_counter)
setS2(10)
console.log(c2()) // Should output 13 after re-evaluation of dependencies
console.log(get_counter, computed_counter, memo_counter, effect_counter)

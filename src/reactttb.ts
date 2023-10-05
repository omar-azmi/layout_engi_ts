type SignalID = number // `SignalID % 4 = 0`
type LazyID = number // `LazyID % 4 = 1`
type MemoID = number // `MemoID % 4 = 2`
type EffectID = number // `EffectID % 4 = 3`
type ObserverID = LazyID | MemoID | EffectID
type Accessor<T> = (observer_id?: ObserverID) => T
type Setter<T> = (value: T) => void
type Runner = () => void
type AccessorSetter<T> = [Accessor<T>, Setter<T>]
type LazyFn<T> = (observer_id?: ObserverID) => T
type MemoFn<T> = (observer_id?: ObserverID) => T
type EffectFn = (observer_id?: ObserverID) => void
type ObserverFn<T> = LazyFn<T> | MemoFn<T> | EffectFn
type Observer<T> = Lazy<T> | Memo<T> | Effect
type NormalFloat = number

/** type definition for a value equality check function. */
export type EqualityFn<T> = (prev_value: T | undefined, new_value: T) => NormalFloat

/** type definition for an equality check specification. <br>
 * when `undefined`, javascript's regular `===` equality will be used. <br>
 * when `false`, equality will always be evaluated to false, meaning that setting any value will always fire a signal, even if it's equal.
*/
export type EqualityCheck<T> = undefined | false | EqualityFn<T>


export interface Signal<T> {
	obvs: Set<ObserverID>
	value: T
	equals: EqualityFn<T>
	set: Setter<T>
	get: Accessor<T>
}

/** represents options when creating a signal via {@link createSignal}. */
export interface CreateSignalOptions<T> {
	/** when a signal's value is updated through a {@link Setter}, then the observers/dependants of
	 * THIS signal will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>
}

export interface Lazy<T> {
	fn: LazyFn<T>
	dirty: boolean
	obvs: Set<ObserverID>
	value?: T
	id?: LazyID
	get: Accessor<T>
}

/** represents options when creating a lazy computation via {@link createLazy}. */
export interface CreateLazyOptions<T> { }


export interface Memo<T> {
	fn: MemoFn<T>
	obvs: Set<ObserverID>
	value?: T
	id?: MemoID
	equals: EqualityFn<T>
	run: Runner
	get: Accessor<T>
}

/** represents options when creating a memo via {@link createMemo}. */
export interface CreateMemoOptions<T> {
	/** when a memo's value is updated through a notification by its one of its dependancy `Signal`s, `Memo`s, or `Lazy`s,
	 * then the observers/dependants of THIS memo will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>
	/** specify initial value for {@link equals} to use when doing the very first comparison of equality. */
	value?: T
	defer?: boolean
}

export interface Effect {
	fn: EffectFn
	id?: EffectID
	run: Runner
}

/** represents options when creating an effect signal via {@link createEffect}. */
export interface CreateEffectOptions {
	/** when `true`, the effect function {@link EffectFn} will not be run immediately (ie the first execution will be skipped),
	 * and its execution will be put off until one of its dependancy `Signal`'s, `Memo`'s, or `Lazy`'s value is updated. <br>
	 * by default, `defer` is `false`, and effects are immediately executed during initialization. <br>
	 * the reason why you might want to defer an effect is because the body of the effect function may contain symbols/variables
	 * that have not been defined yet, in which case an error will be raised, unless you choose to defer the first execution. <br>
	*/
	defer?: boolean
}


const default_equality = (<T>(v1: T, v2: T) => +(v1 === v2)) satisfies EqualityFn<any>
const falsey_equality = (<T>(v1: T, v2: T) => 0) satisfies EqualityFn<any>

const createContext = () => {
	let id_counter: SignalID = -4
	const
		all_observers: Map<ObserverID, Observer<any>> = new Map(),
		queued_rerun_ids: Array<Set<MemoID | EffectID>> = [],
		increment_id_counter = () => (id_counter += 4)

	/** notify a set of observers of a change in a dependancy's value.
	 * - a `Lazy` observer will become `dirty`
	 * - a `Memo` observer will be queued to rerun.
	 *   during its rerun, if the memo's new value does not equal to its old value,
	 *   then it will notify its own observers
	 * - an `Effect` observer will be queued to rerun
	*/
	const notify = (observers: Set<ObserverID>, rerun_ids: Set<MemoID | EffectID> = new Set()): typeof rerun_ids => {
		for (const id of observers) {
			if (id % 4 === 1) {
				// `id` is `LazyID`
				const obv = all_observers.get(id)! as Lazy<any>
				if (!obv.dirty) {
					obv.dirty = true
					notify(obv.obvs, rerun_ids)
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
		let rerun_ids: Set<number>
		let delay_rerun_ids: Set<number> = new Set()
		do {
			rerun_ids = queued_rerun_ids.shift() ?? new Set()
			for (const delayed_id of delay_rerun_ids) {
				rerun_ids.add(delayed_id)
			}
			delay_rerun_ids.clear()
			const
				rerun_memos_and_effects: (Memo<any> | Effect | undefined)[] = [...rerun_ids].map((id) => all_observers.get(id) as (Memo<any> | Effect | undefined)),
				memos_len = rerun_memos_and_effects.length
			for (let i = 0; i < memos_len; i++) {
				rerun_memos_and_effects[i]?.obvs?.forEach((id: ObserverID) => {
					if (id % 4 > 1 && rerun_ids.has(id)) {
						rerun_ids.delete(id as MemoID | EffectID)
						delay_rerun_ids.add(id as MemoID | EffectID)
						rerun_memos_and_effects[i] = undefined
					}
				})
			}
			rerun_memos_and_effects.forEach((memo_or_effect) => { memo_or_effect?.run() })
		} while (rerun_ids.size > 0)
	}

	const Signal = class <T> implements Signal<T>{
		obvs: Set<ObserverID> = new Set()
		equals: EqualityFn<T>

		constructor(
			public value: T,
			equals?: EqualityCheck<T>,
		) {
			this.equals = (equals ?? default_equality) || falsey_equality
		}

		set: Setter<T> = (value) => {
			if (this.equals(this.value, value) < 0.5) {
				this.value = value
				queued_rerun_ids.push(notify(this.obvs))
				rerun_memos_and_effects()
			}
		}

		get: Accessor<T> = (observer_id) => {
			if (observer_id) { this.obvs.add(observer_id) }
			return this.value
		}
	}

	const Lazy = class <T> implements Lazy<T>{
		obvs: Set<ObserverID> = new Set()
		value?: T
		dirty: boolean

		constructor(
			public fn: LazyFn<T>,
			public id?: LazyID,
		) {
			this.dirty = true
		}

		get: Accessor<T> = (observer_id) => {
			if (observer_id) { this.obvs.add(observer_id) }
			if (this.dirty) {
				this.value = this.fn(this.id)
				this.dirty = false
				// destoy `this.id`, because there's no longer a need to notify this lazy's dependancy memos, laziess,
				// and signals inside of `this.fn`, since they've been notified before (in the `this.value = this.fn(this.id)` line)
				this.id = undefined
			}
			return this.value!
		}
	}

	const Memo = class <T> implements Memo<T>{
		obvs: Set<ObserverID> = new Set()
		equals: EqualityFn<T>

		constructor(
			public fn: MemoFn<T>,
			public id?: MemoID,
			public value?: T,
			equals?: EqualityCheck<T>,
		) {
			this.equals = (equals ?? default_equality) || falsey_equality
			add_rerun_id(id!)
		}

		run: Runner = () => {
			const value = this.fn(this.id)
			// destoy `this.id`, because there's no longer a need to notify this memo's dependancy memos, lazies,
			// and signals inside of `this.fn`, since they've been notified before (in the `this.value = this.fn(this.id)` line)
			this.id = undefined
			// only notify observers if the value has changed
			if (this.equals(this.value, value) < 0.5) {
				this.value = value
				queued_rerun_ids.push(notify(this.obvs))
				rerun_memos_and_effects()
			}
		}

		get: Accessor<T> = (observer_id) => {
			if (observer_id) { this.obvs.add(observer_id) }
			return this.value!
		}
	}

	const Effect = class implements Effect {
		constructor(
			public fn: EffectFn,
			public id?: EffectID,
		) {
			add_rerun_id(id!)
		}

		run: Runner = () => {
			this.fn(this.id)
			// destoy `this.id`, because there's no longer a need to notify this effects's dependancy memos, lazies,
			// and signals inside of `this.fn`, since they've been notified before (in the `this.fn(this.id)` line)
			this.id = undefined
		}
	}

	const createSignal = <T>(initial_value: T, { equals }: CreateSignalOptions<T> = {}): AccessorSetter<T> => {
		const signal = new Signal<T>(initial_value, equals)
		return [signal.get, signal.set]
	}

	const createLazy = <T>(fn: LazyFn<T>, options?: CreateLazyOptions<T>): Accessor<T> => {
		const
			lazy_id: LazyID = increment_id_counter() + 1,
			lazy = new Lazy<T>(fn, lazy_id)
		all_observers.set(lazy_id, lazy)
		return lazy.get
	}

	const createMemo = <T>(fn: MemoFn<T>, { value, equals, defer = true }: CreateMemoOptions<T> = {}): Accessor<T> => {
		const
			memo_id: MemoID = increment_id_counter() + 2,
			memo = new Memo<T>(fn, memo_id, value, equals)
		all_observers.set(memo_id, memo)
		if (!defer) { memo.run() }
		return memo.get
	}

	const createEffect = (fn: EffectFn, { defer = true }: CreateEffectOptions = {}): Runner => {
		const
			effect_id: EffectID = increment_id_counter() + 3,
			effect = new Effect(fn, effect_id)
		all_observers.set(effect_id, effect)
		if (!defer) { effect.run() }
		return effect.run
	}

	return { createSignal, createLazy, createMemo, createEffect }
}

// Example usage
const { createSignal, createLazy, createMemo, createEffect } = createContext()

const [s1, setS1] = createSignal<number>(1)
const [s2, setS2] = createSignal<number>(2)

const l1 = createLazy((id) => s1(id) * 2)
const l2 = createLazy((id) => s2(id) + l1(id))

const m1 = createMemo((id) => s1(id) * 2)
const m2 = createMemo((id) => s2(id) + l1(id))

const e1 = createEffect((id) => {
	console.log(`I seek s1 and l2: ${s1(id)}, ${l2(id)}`)
	console.log(`I seek m1 and m2: ${m1(id)}, ${m2(id)}`)
})

//console.log(get_counter, computed_counter, memo_counter, effect_counter)
console.log(l2()) // Should output 0, as it's not computed yet
//console.log(get_counter, computed_counter, memo_counter, effect_counter)
setS1(3)
//console.log(get_counter, computed_counter, memo_counter, effect_counter)
setS2(10)
console.log(l2()) // Should output 13 after re-evaluation of dependencies
//console.log(get_counter, computed_counter, memo_counter, effect_counter)

import { Accessor, Context, LazySignal_Factory, MemoSignal_Factory, Setter, StateSignal_Factory, EffectSignal_Factory } from "./deps.js"
export { throttlingEquals, type Accessor, type Setter } from "./deps.js"

// TODO: document what the the signals do to the end user, or refer them to `tsignal_ts`'s documentation

export const
	signalCtx = new Context(),
	createStateSignal = signalCtx.addClass(StateSignal_Factory),
	createMemoSignal = signalCtx.addClass(MemoSignal_Factory),
	createLazySignal = signalCtx.addClass(LazySignal_Factory),
	createEffectSignal = signalCtx.addClass(EffectSignal_Factory)

export const createState = <T>(...args: Parameters<typeof createStateSignal<T>>): [ReturnType<typeof createStateSignal<T>>[1], ReturnType<typeof createStateSignal<T>>[2]] => {
	return createStateSignal(...args).splice(1) as [Accessor<T>, Setter<T>]
}

export const createMemo = <T>(...args: Parameters<typeof createMemoSignal<T>>): ReturnType<typeof createMemoSignal<T>>[1] => {
	return createMemoSignal(...args)[1]
}

export const createLazy = <T>(...args: Parameters<typeof createLazySignal<T>>): ReturnType<typeof createLazySignal<T>>[1] => {
	return createLazySignal(...args)[1]
}

export const createStateIfPrimitive = <T>(value: T | Accessor<T>): [get: Accessor<T>, set?: Setter<T>] => {
	return typeof value === "function" ?
		[value as Accessor<T>, undefined] :
		createState<T>(value)
}

export class SignalingClass {
	/** create a computation signal. <br>
	 * the signal will behave either {@link createMemo | lazily} or {@link createMemo | actively} based on
	 * whether or not the `lazy` parameter was true when constructing the new instance.
	*/
	protected comp: typeof createMemo | typeof createLazy

	/** create a dependence of a computation on the default dirty signal provided by this class. */
	public isDirty!: Accessor<void>

	/** declare this object to be dirty, so that computations can rerun if this class is not lazy.
	 * otherwise, rerun lazily when something that depends on one of the computations tries to retrieve the value.
	*/
	public setDirty!: Setter<void>

	private paused = false

	/** manually disable reactivity of {@link isDirty | `isDirty`} accessor, until unpasued by {@link resumeReactivity} */
	pauseReactivity() { this.paused = true }

	/** resume reactivity of {@link isDirty | `isDirty`} accessor, if it had previously been pasued by {@link pauseReactivity} */
	resumeReactivity() { this.paused = false }

	constructor(lazy: boolean) {
		const [isDirty, setDirty] = createState<void>(undefined, { equals: () => { return this.paused } })
		this.comp = lazy ? createLazy : createMemo
		this.isDirty = isDirty
		this.setDirty = setDirty
	}
}

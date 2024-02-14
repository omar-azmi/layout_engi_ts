import { Accessor, Context, MemoSignal_Factory, Setter, StateSignal_Factory } from "./deps.ts"
export { type Accessor, type Setter, throttlingEquals } from "./deps.ts"

// TODO: document what the the signals do to the end user, or refer them to `tsignal_ts`'s documentation

export const
	signalCtx = new Context(),
	createStateSignal = signalCtx.addClass(StateSignal_Factory),
	createMemoSignal = signalCtx.addClass(MemoSignal_Factory)

export const createState = <T>(...args: Parameters<typeof createStateSignal<T>>): [ReturnType<typeof createStateSignal<T>>[1], ReturnType<typeof createStateSignal<T>>[2]] => {
	return createStateSignal(...args).splice(1) as [Accessor<T>, Setter<T>]
}

export const createMemo = <T>(...args: Parameters<typeof createMemoSignal<T>>): ReturnType<typeof createMemoSignal<T>>[1] => {
	return createMemoSignal(...args)[1]
}
export const createStateIfPrimitive = <T>(value: T | Accessor<T>): [get: Accessor<T>, set?: Setter<T>] => {
	return typeof value === "function" ?
		[value as Accessor<T>, undefined] :
		createState<T>(value)
}

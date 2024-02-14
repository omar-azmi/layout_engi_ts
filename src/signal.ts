import { Accessor, Context, MemoSignal_Factory, Setter, StateSignal_Factory } from "./deps.ts"
export { type Accessor, type Setter, throttlingEquals } from "./deps.ts"

// TODO: find an appropriate name for `signal_ctx`, `_createState`, and `_createMemo`, so that it is exportable to the end user,
// and so that they understand their purpose and their differences from the convenience `createState` and `createMemo` counterparts.
export const
	signal_ctx = new Context(),
	_createState = signal_ctx.addClass(StateSignal_Factory),
	_createMemo = signal_ctx.addClass(MemoSignal_Factory)

export const createState = <T>(...args: Parameters<typeof _createState<T>>): [ReturnType<typeof _createState<T>>[1], ReturnType<typeof _createState<T>>[2]] => {
	return _createState(...args).splice(1) as [Accessor<T>, Setter<T>]
}
export const createMemo = <T>(...args: Parameters<typeof _createMemo<T>>): ReturnType<typeof _createMemo<T>>[1] => {
	return _createMemo(...args)[1]
}
export const createStateIfPrimitive = <T>(value: T | Accessor<T>): [get: Accessor<T>, set?: Setter<T>] => {
	return typeof value === "function" ?
		[value as Accessor<T>, undefined] :
		createState<T>(value)
}

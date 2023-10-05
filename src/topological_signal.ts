type Signal<T> = {
	id: number
	value?: T
	fn: (signalId: number) => T
	observers: Set<number>
	dependencies: Set<number>
}

type StateSignal<T> = Signal<T>
type MemoSignal<T> = Signal<T>
type EffectSignal = Signal<void>

type ReactiveSystem = {
	signals: Map<number, Signal<any>>
}

const system: ReactiveSystem = {
	signals: new Map()
}

function createSignal<T>(id: number, fn: (signalId: number) => T): Signal<T> {
	return { id, fn, observers: new Set(), dependencies: new Set(), value: undefined }
}

const createStateSignal = <T>(
	id: number,
	fn: (signalId: number) => T
): StateSignal<T> => {
	const signal = createSignal(id, fn)
	system.signals.set(id, signal)
	return signal
}
const createMemoSignal = createStateSignal as <T>(id: number, computeFn: (signalId: number) => T) => MemoSignal<T>
const createEffectSignal = createStateSignal as (id: number, effectFn: (signalId: number) => void) => EffectSignal

const getSignalValue = <T>(signal: Signal<T>, observer_id?: number): T => {
	console.table([["GET SIGNAL", "BY OBSERVER"], [signal.id, observer_id]])
	if (observer_id) {
		signal.observers.add(observer_id)
		getSignal(observer_id)?.dependencies.add(signal.id)
	}
	return signal.value ?? signal.fn(signal.id)
}

const getSignal = (signalId: number): Signal<any> | undefined => {
	return system.signals.get(signalId)
}

const updateState = <T>(signalId: number, newFn: (signalId?: number) => T): void => {
	const
		signal = getSignal(signalId) as Signal<T>,
		newValue = newFn()
	if (signal && signal.value !== newValue) {
		signal.fn = newFn
		signal.value = newValue
		const toVisit = new Set<number>()
		const inorder_visiter = (signaler: Signal<any>) => {
			for (const observer of signaler.observers) {
				toVisit.add(observer)
				const observer_signal = getSignal(observer)
				if (observer_signal) { inorder_visiter(observer_signal) }
			}
		}
		inorder_visiter(signal)
		propagateUpdate(signal.observers, toVisit)
	}
}

const propagateUpdate = (observers: Set<number>, toVisit: Set<number>): void => {
	for (const observer of observers) {
		updateMemo(observer, toVisit)
		//runEffect(observer, visited)
	}
}

const updateMemo = (memoId: number, toVisit: Set<number>): void => {
	if (toVisit.delete(memoId)) {
		console.log(memoId)
		const memo = getSignal(memoId) as MemoSignal<any>
		for (const dependency of memo.dependencies) {
			updateMemo(dependency, toVisit)
		}
		const newValue = getSignalValue(memo)
		if (memo.value !== newValue) {
			memo.value = newValue
			propagateUpdate(memo.observers, toVisit)
		}
	}
}


let id_counter = 65
const createID = () => String.fromCodePoint(id_counter++)
const
	A = createStateSignal(createID(), (id) => 101),
	B = createStateSignal(createID(), (id) => 102),
	C = createStateSignal(createID(), (id) => 103)
const
	D = createMemoSignal(createID(), (id) => {
		return getSignalValue(A, id)
	}),
	E = createMemoSignal(createID(), (id) => {
		return getSignalValue(D, id) +
			getSignalValue(B, id) +
			getSignalValue(C, id) +
			getSignalValue(F, id)
	}),
	F = createMemoSignal(createID(), (id) => {
		return getSignalValue(C, id)
	}),
	G = createMemoSignal(createID(), (id) => {
		return getSignalValue(D, id) +
			getSignalValue(E, id)
	}),
	H = createMemoSignal(createID(), (id) => {
		return getSignalValue(A, id) +
			getSignalValue(G, id)
	}),
	I = createMemoSignal(createID(), (id) => {
		return getSignalValue(F, id)
	})


getSignalValue(I)
getSignalValue(H)
clear()
updateState(A.id, () => 100)

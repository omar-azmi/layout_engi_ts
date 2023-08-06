import { Accessor, ConstructorOf, MethodsOf, Setter, Signal, SignalOptions, max, min, createSignal, createMemo } from "./deps.ts"

interface FrameCutInit {
	id?: number
	children?: FrameCut[]
}

interface FrameZCInfoAccessor {
	left: Accessor<number>
	right: Accessor<number>
}

interface FrameZCInfoSetter {
	left: Setter<number>
	right: Setter<number>
}

class FrameCut implements FrameZCInfoAccessor {
	static id_count: number = 0

	left: Accessor<number>
	right: Accessor<number>

	setLeft?: Setter<number>
	setRight?: Setter<number>

	id: number
	children: FrameCut[]

	constructor(
		left: number | Accessor<number>,
		right: number | Accessor<number>,
		config?: FrameCutInit,
	) {
		this.children = config?.children ?? []
		this.id = (config?.id ?? FrameCut.id_count++);
		[this.left, this.setLeft] = (typeof left === "number" ? createSignal(left) : [left, undefined]);
		[this.right, this.setRight] = (typeof right === "number" ? createSignal(right) : [right, undefined])
	}

	getFreespaceChild = (): FrameCut => {
		const
			{ children } = this,
			len = children.length
		if (len > 0) { return children[0] }
		const
			{ left, right } = this,
			freespace_child = new FrameCut(left, right)
		children.push(freespace_child)
		return freespace_child
	}

	leftSplitChild = (value: number | Accessor<number>, margin: number | Accessor<number> = 0): FrameCut => {
		const
			{ getFreespaceChild, children } = this,
			freespace = getFreespaceChild(),
			{ left, right } = freespace,
			new_left = typeof value === "number" ? (typeof margin === "number" ?
				createMemo(() => min(left() + value, right() - margin)) :
				createMemo(() => min(left() + value, right() - margin()))
			) : (typeof margin === "number" ?
				createMemo(() => min(left() + value(), right() - margin)) :
				createMemo(() => min(left() + value(), right() - margin()))
			),
			child_framecut = new FrameCut(left, new_left)
		freespace.left = (typeof margin === "number" ?
			createMemo(() => min(new_left() + margin, right())) :
			createMemo(() => min(new_left() + margin(), right()))
		)
		children.push(child_framecut)
		return child_framecut
	}

}


const layout = new FrameCut(20, 80)
layout.leftSplitChild(30, 5)
layout.leftSplitChild(10, 2)
layout.leftSplitChild(50, 8)

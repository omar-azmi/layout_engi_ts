import { ConstructorOf, MethodsOf, max, min } from "./deps.ts"
import {SpriteRect, FrameZCInfo} from "./typedefs.ts"

type InstanceLike<T> = InstanceType<ConstructorOf<T>>

interface ActionHistoryEntry<T, FN extends keyof MethodsOf<T> = keyof MethodsOf<T>> {
	node: T,
	action: FN,
	args: any[]
}

type Recordable<T> = T & {
	history: ActionHistoryEntry<T>[]
}

class FrameCut implements FrameZCInfo {
	constructor(
		public left: number,
		public top: number,
		public right: number,
		public bottom: number,
	) { }

	/** cut the left portion of this rectangle by amount `value`, and receive the divided portion as a new recangle. <br>
	 * additionally, you can specify a left `margin` to guarantee a spacing between the newly cut out rectangle, and this rectangle. 
	*/
	cutLeft(value: number, margin: number = 0): FrameCut {
		const
			{ left, top, right, bottom } = this,
			new_left = min(left + value, right - margin)
		this.left = min(new_left + margin, right)
		return new FrameCut(left, top, new_left, bottom)
	}

	/** cut the right portion of this rectangle by amount `value`, and receive the divided portion as a new recangle. <br>
	 * additionally, you can specify a right `margin` to guarantee a spacing between the newly cut out rectangle, and this rectangle. 
	*/
	cutRight(value: number, margin: number = 0): FrameCut {
		const
			{ left, top, right, bottom } = this,
			new_right = max(right - value, left + margin)
		this.right = max(new_right - margin, left)
		return new FrameCut(new_right, top, right, bottom)
	}

	/** cut the top portion of this rectangle by amount `value`, and receive the divided portion as a new recangle. <br>
	 * additionally, you can specify a top `margin` to guarantee a spacing between the newly cut out rectangle, and this rectangle.
	*/
	cutTop(value: number, margin: number = 0): FrameCut {
		const
			{ left, top, right, bottom } = this,
			new_top = min(top + value, bottom - margin)
		this.top = min(new_top + margin, bottom)
		return new FrameCut(left, top, right, new_top)
	}

	/** cut the bottom portion of this rectangle by amount `value`, and receive the divided portion as a new recangle. <br>
	 * additionally, you can specify a bottom `margin` to guarantee a spacing between the newly cut out rectangle, and this rectangle. 
	*/
	cutBottom(value: number, margin: number = 0): FrameCut {
		const
			{ left, top, right, bottom } = this,
			new_bottom = max(bottom - value, top + margin)
		this.bottom = max(new_bottom - margin, top)
		return new FrameCut(left, new_bottom, right, bottom)
	}

	/** decrease the dimensions of this rectangle from any side */
	pad = (
		left: number = 0,
		top: number = 0,
		right: number = 0,
		bottom: number = 0,
	) => {
		this.left -= left
		this.top -= top
		this.right -= right
		this.bottom -= bottom
	}

	/** convert to a `Rect` object */
	toRect = (): SpriteRect => {
		const { left, top, right, bottom } = this
		return {
			x: left,
			y: top,
			width: right - left,
			height: bottom - top,
		}
	}

	toString = () => {
		const { left, top, right, bottom } = this
		return [left, top, right, bottom]
	}

	static recordable_cut_methods: Set<keyof FrameCut> = new Set(["cutLeft", "cutRight", "cutTop", "cutBottom"])
	static recordable_other_methods: Set<keyof FrameCut> = new Set(["pad"])
	static recordable_proxy_handler: ProxyHandler<Recordable<FrameCut>> = {
		get(target: Recordable<FrameCut>, prop: keyof FrameCut, receiver: any) {
			const
				member = target[prop],
				history = target.history
			if (FrameCut.recordable_cut_methods.has(prop)) {
				return (value: number, margin?: number) => {
					history.push({
						node: target,
						action: prop,
						args: [value, margin],
					})
					return member.apply(target, [value, margin]).toRecordable(history)
				}
			} else if (FrameCut.recordable_other_methods.has(prop)) {
				return (...args: any[]) => {
					history.push({
						node: target,
						action: prop,
						args,
					})
					return member.apply(target, args)
				}
			} else {
				return member
			}
		}
	}

	toRecordable(history: ActionHistoryEntry<FrameCut>[]): Recordable<FrameCut> {
		if (this.history === undefined) {
			this.history = history
			return new Proxy(this as Recordable<FrameCut>, FrameCut.recordable_proxy_handler)
		}
		return this as Recordable<FrameCut>
	}

	static createRecordable(
		history: ActionHistoryEntry<FrameCut>[],
		left: number, top: number, right: number, bottom: number,
	): Recordable<FrameCut> {
		const new_framecut = new FrameCut(left, top, right, bottom)
		history.push({
			node: new_framecut,
			action: "constructor",
			args: [left, top, right, bottom],
		})
		return new_framecut.toRecordable(history)
	}

	static executeAction(action_description: ActionHistoryEntry<FrameCut>, history: ActionHistoryEntry<FrameCut>[] = []) {
		const {node, action, args} = action_description
		if(action === "constructor") {
			return new FrameCut.createRecordable(history, ...args)
		} else if (FrameCut.recordable_cut_methods.has(action)) {
			return node[action](...args)
		} else if (FrameCut.recordable_other_methods.has(action)) {
			return node[action](...args)
		}
		return undefined
	}
}


/// example

const
	hist: ActionHistoryEntry<FrameCut>[] = [],
	collate_rect = FrameCut.createRecordable(hist, 0, 0, 1000, 1000),
	stripe0 = collate_rect.cutTop(160),
	stripe1 = collate_rect.cutTop(160),
	stripe2 = collate_rect.cutTop(160),
	stripe3 = collate_rect.cutTop(160)

const
	word00 = stripe0.cutRight(240),
	word01 = stripe0.cutRight(160),
	word02 = stripe0.cutRight(320),
	word03 = stripe0.cutRight(260),
	word10 = stripe1.cutRight(240),
	word11 = stripe1.cutRight(160),
	word12 = stripe1.cutRight(320),
	word13 = stripe1.cutRight(260),
	word20 = stripe2.cutRight(240),
	word21 = stripe2.cutRight(160),
	word22 = stripe2.cutRight(320),
	word23 = stripe2.cutRight(260),
	word30 = stripe3.cutRight(240),
	word31 = stripe3.cutRight(160),
	word32 = stripe3.cutRight(320),
	word33 = stripe3.cutRight(260)


console.log(hist)
// console.log(JSON.stringify(layout))

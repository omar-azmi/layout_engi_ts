import { Accessor, ConstructorOf, MethodsOf, Setter, Signal, SignalOptions, createEffect, max, min, createSignal, createMemo, untrack } from "./deps.ts"

type CombinationLiteral<A extends string, B extends string, SEP extends string = "+" | " + "> = A | `${A}${SEP}${B}` | B

type PixelUnitLiteral = `${number}px`
type ViewWidthUnitLiteral = `${number}vw`
type ViewHeightUnitLiteral = `${number}vh`
type LengthUnitLiteral = CombinationLiteral<PixelUnitLiteral, CombinationLiteral<ViewWidthUnitLiteral, ViewHeightUnitLiteral>>
interface LengthUnit {
	px?: number
	vw?: number
	vh?: number
}

const length_unit_name_iter = ["px", "vw", "vh"] as const
const parseLengthUnit = (str: LengthUnitLiteral): LengthUnit => {
	const length_units: Required<LengthUnit> = { px: 0, vw: 0, vh: 0 }
	for (const unit_str of str.split("+")) {
		const
			unit_str_trimmed = unit_str.trim(),
			value: number = + unit_str_trimmed.slice(0, -2),
			unit = unit_str_trimmed.slice(-2) as keyof LengthUnit
		length_units[unit] += value
	}
	return length_units
}
const stringifyLengthUnit = (length_units: LengthUnit): LengthUnitLiteral => {
	return length_unit_name_iter.map(
		(unit_name) => (String(length_units[unit_name] ?? 0) + unit_name)
	).join(" + ") as LengthUnitLiteral
}

type AnyNumber = number | Accessor<number>

interface DimensionXValue {
	left?: number
	right?: number
}
interface DimensionYValue {
	top?: number
	bottom?: number
}
interface DimensionXGetter {
	left?: Accessor<number>
	right?: Accessor<number>
}
interface DimensionYGetter {
	top?: Accessor<number>
	bottom?: Accessor<number>
}
interface DimensionXSetter {
	left?: Setter<number>
	right?: Setter<number>
}
interface DimensionYSetter {
	top?: Setter<number>
	bottom?: Setter<number>
}

type MarginConfig = DimensionXValue & DimensionYValue
type MarginValue = Required<MarginConfig>
type MarginGetter = Accessor<MarginValue>
type MarginSetter = Setter<MarginValue>

const ltrb_iter = ["left", "top", "right", "bottom"] as const
const createSignalIfPrimitive = <T>(value: T | Accessor<T>): [get: Accessor<T>, set?: Setter<T>] => {
	return typeof value === "function" ?
		[value as Accessor<T>, undefined] :
		createSignal<T>(value)
}

class FrameSplit implements Required<DimensionXGetter & DimensionYGetter> {
	declare left: Accessor<number>
	declare top: Accessor<number>
	declare right: Accessor<number>
	declare bottom: Accessor<number>
	declare margin?: MarginGetter
	declare width?: Accessor<LengthUnit>
	declare height?: Accessor<LengthUnit>
	declare set: (DimensionXSetter & DimensionYSetter) & {
		margin?: MarginSetter,
		width?: Setter<LengthUnit>,
		height?: Setter<LengthUnit>,
	}

	children: FrameSplit[]

	constructor(
		left: AnyNumber,
		top: AnyNumber,
		right: AnyNumber,
		bottom: AnyNumber,
	) {
		const
			ltrb = [left, top, right, bottom],
			set: FrameSplit["set"] = {}
		for (let i = 0; i < 4; i++) {
			const
				dim_name = ltrb_iter[i],
				dim = ltrb[i],
				[dim_getter, dim_setter] = createSignalIfPrimitive(dim)
			this[dim_name] = dim_getter
			set[dim_name] = dim_setter
		}
		this.set = set
		this.children = []
	}

	getFreespaceChild = (): FrameSplit => {
		const
			{ children } = this,
			len = children.length
		if (len > 0) { return children[0] }
		const
			{ left, top, right, bottom } = this,
			freespace_child = new FrameSplit(left, top, right, bottom)
		children.push(freespace_child)
		return freespace_child
	}

	splitChildLeft = (
		width: LengthUnit | LengthUnitLiteral,
		margin: DimensionXValue = {},
	) => {
		if (typeof margin !== "function") {
			margin.left ??= 0
			margin.right ??= 0
		}
		const
			{ getFreespaceChild, children } = this,
			freespace = getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getWidth, setWidth] = createSignalIfPrimitive(typeof width === "string" ? parseLengthUnit(width) : width),
			[getMargin, setMargin] = createSignalIfPrimitive({ ...margin, top: 0, bottom: 0 } as MarginValue),
			child_left = createMemo(() => {
				const { left: ml = 0, right: mr = 0 } = getMargin()
				return min(left() + ml, right() - mr)
			}),
			child_right = createMemo(() => {
				const
					{ left: ml = 0, right: mr = 0 } = getMargin(),
					l = left() + ml,
					r = max(right() - mr, l),
					t = top(),
					b = bottom(),
					{ px = 0, vw = 0, vh = 0 } = getWidth()
				return min(l + px + (r - l) * vw + (b - t) * vh, r)
			}),
			child_framesplit = new FrameSplit(child_left, top, child_right, bottom)
		child_framesplit.margin = getMargin
		child_framesplit.width = getWidth
		child_framesplit.set.margin = setMargin
		child_framesplit.set.width = setWidth
		freespace.left = createMemo(() => min(child_right() + getMargin().right, right()))
		children.push(child_framesplit)
		return child_framesplit
	}

	splitChildTop = (
		height: LengthUnit | LengthUnitLiteral,
		margin: DimensionYValue = {},
	) => {
		if (typeof margin !== "function") {
			margin.top ??= 0
			margin.bottom ??= 0
		}
		const
			{ getFreespaceChild, children } = this,
			freespace = getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getHeight, setHeight] = createSignalIfPrimitive(typeof height === "string" ? parseLengthUnit(height) : height),
			[getMargin, setMargin] = createSignalIfPrimitive({ ...margin, left: 0, right: 0 } as MarginValue),
			child_top = createMemo(() => {
				const { top: mt = 0, bottom: mb = 0 } = getMargin()
				return min(top() + mt, bottom() - mb)
			}),
			child_bottom = createMemo(() => {
				const
					{ top: mt = 0, bottom: mb = 0 } = getMargin(),
					l = left(),
					r = right(),
					t = top() + mt,
					b = max(bottom() - mb, t),
					{ px = 0, vw = 0, vh = 0 } = getHeight()
				return min(t + px + (r - l) * vw + (b - t) * vh, b)
			}),
			child_framesplit = new FrameSplit(left, child_top, right, child_bottom)
		child_framesplit.margin = getMargin
		child_framesplit.height = getHeight
		child_framesplit.set.margin = setMargin
		child_framesplit.set.height = setHeight
		freespace.top = createMemo(() => min(child_bottom() + getMargin().bottom, bottom()))
		children.push(child_framesplit)
		return child_framesplit
	}

	splitChildRight = (
		width: LengthUnit | LengthUnitLiteral,
		margin: DimensionXValue = {},
	) => {
		if (typeof margin !== "function") {
			margin.left ??= 0
			margin.right ??= 0
		}
		const
			{ getFreespaceChild, children } = this,
			freespace = getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getWidth, setWidth] = createSignalIfPrimitive(typeof width === "string" ? parseLengthUnit(width) : width),
			[getMargin, setMargin] = createSignalIfPrimitive({ ...margin, top: 0, bottom: 0 } as MarginValue),
			child_left = createMemo(() => {
				const
					{ left: ml = 0, right: mr = 0 } = getMargin(),
					l = left() + ml,
					r = max(right() - mr, l),
					t = top(),
					b = bottom(),
					{ px = 0, vw = 0, vh = 0 } = getWidth()
				return max(r - px - (r - l) * vw - (b - t) * vh, l)
			}),
			child_right = createMemo(() => {
				const { left: ml = 0, right: mr = 0 } = getMargin()
				return max(left() + ml, right() - mr)
			}),
			child_framesplit = new FrameSplit(child_left, top, child_right, bottom)
		child_framesplit.margin = getMargin
		child_framesplit.width = getWidth
		child_framesplit.set.margin = setMargin
		child_framesplit.set.width = setWidth
		freespace.right = createMemo(() => max(child_left() + getMargin().left, left()))
		children.push(child_framesplit)
		return child_framesplit
	}

	splitChildBottom = (
		height: LengthUnit | LengthUnitLiteral,
		margin: DimensionYValue = {},
	) => {
		if (typeof margin !== "function") {
			margin.top ??= 0
			margin.bottom ??= 0
		}
		const
			{ getFreespaceChild, children } = this,
			freespace = getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getHeight, setHeight] = createSignalIfPrimitive(typeof height === "string" ? parseLengthUnit(height) : height),
			[getMargin, setMargin] = createSignalIfPrimitive({ ...margin, left: 0, right: 0 } as MarginValue),
			child_top = createMemo(() => {
				const
					{ top: mt = 0, bottom: mb = 0 } = getMargin(),
					l = left(),
					r = right(),
					t = top() + mt,
					b = max(bottom() - mb, t),
					{ px = 0, vw = 0, vh = 0 } = getHeight()
				return max(b - px - (r - l) * vw - (b - t) * vh, t)
			}),
			child_bottom = createMemo(() => {
				const { top: mt = 0, bottom: mb = 0 } = getMargin()
				return max(top() + mt, bottom() - mb)
			}),
			child_framesplit = new FrameSplit(left, child_top, right, child_bottom)
		child_framesplit.margin = getMargin
		child_framesplit.height = getHeight
		child_framesplit.set.margin = setMargin
		child_framesplit.set.height = setHeight
		freespace.bottom = createMemo(() => max(child_top() + getMargin().top, top()))
		children.push(child_framesplit)
		return child_framesplit
	}

	toString = (): Object => {
		const
			{ left, top, right, bottom, margin, width, height, set, children } = this,
			setters: string[] = [],
			obj = {
				setters,
				position: [left(), top(), right(), bottom()],
			}
		for (const key in set) { if (set[key] !== undefined) { setters.push(key) } }
		if (margin) {
			const { left, top, right, bottom } = margin()
			obj.margin = [left, top, right, bottom]
		}
		if (width) { obj.width = width() }
		if (height) { obj.height = height() }
		if (children.length > 0) { obj.children = children.map((v) => v.toString()) }
		return obj
	}

	toPreview = (ctx: CanvasRenderingContext2D) => {
		console.log("YET TO IMPLEMENT")
	}
}

// run

const layout = new FrameSplit(0, 20, 200, 80)
layout.splitChildLeft({ px: 30, vw: 0.5 })
layout.splitChildRight({ vw: 0.25 }).splitChildTop("50px", { top: 10 })
layout.splitChildBottom("10px + 0.25vh", { bottom: 10 })

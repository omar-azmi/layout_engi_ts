import { constructFrom, max, min, number_isFinite } from "./deps.ts"
import { Accessor, Setter, createMemo, createStateIfPrimitive } from "./signal.ts"

type CombinationLiteral<A extends string, B extends string, SEP extends string = "+" | " + "> = A | `${A}${SEP}${B}` | B

type PixelUnitLiteral = `${number}px`
type ViewWidthUnitLiteral = `${number}vw`
type ViewHeightUnitLiteral = `${number}vh`
export type LengthUnitLiteral = CombinationLiteral<PixelUnitLiteral, CombinationLiteral<ViewWidthUnitLiteral, ViewHeightUnitLiteral>>
export interface LengthUnit {
	px?: number
	vw?: number
	vh?: number
}
export type AnyLength = LengthUnit | LengthUnitLiteral | number | `{number}`

const length_unit_name_iter = ["px", "vw", "vh"] as const
const parseLengthUnitLiteral = (str: LengthUnitLiteral): LengthUnit => {
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
export const parseLengthUnit = (length: AnyLength): Partial<LengthUnit> => {
	if (typeof length === "object") { return length }
	const px_only_length = Number(length)
	if (number_isFinite(px_only_length)) { return { px: px_only_length } }
	return parseLengthUnitLiteral(length as LengthUnitLiteral)
}
export const stringifyLengthUnit = (length: AnyLength): LengthUnitLiteral => {
	const length_unit = parseLengthUnit(length)
	return length_unit_name_iter.map(
		(unit_name) => (String(length_unit[unit_name] ?? 0) + unit_name)
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

export type MarginConfig = DimensionXValue & DimensionYValue
export type MarginValue = Required<MarginConfig>
export type MarginGetter = Accessor<MarginValue>
export type MarginSetter = Setter<MarginValue>

const ltrb_iter = ["left", "top", "right", "bottom"] as const

const uniqueIndexes = (max_value: number, quantity: number) => {
	const number_set = new Set<number>()
	while (number_set.size < quantity) {
		number_set.add(Math.floor(Math.random() * max_value))
	}
	return Array.from(number_set)
}
const pickUnique = function* <T>(arr: T[]) {
	let
		len = arr.length,
		idxs = uniqueIndexes(len - 1, len - 1)
	while (true) {
		for (const i of idxs) {
			yield arr[i]
		}
	}
}
const colors = ["aqua", "aquamarine", "antiquewhite", "blue", "brown", "blueviolet", "chartreuse", "crimson", "darkkhaki", "darkorange", "darksalmon", "fuchsia", "gold", "green", "orangered", "yellow", "yellowgreen"]
export const pick_color_iter = pickUnique(colors)

export class FrameSplit implements Required<DimensionXGetter & DimensionYGetter> {
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

	children: FrameSplit[] = []

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
				[dim_getter, dim_setter] = createStateIfPrimitive(dim)
			this[dim_name] = dim_getter
			set[dim_name] = dim_setter
		}
		this.set = set
	}

	getFreespaceChild(): FrameSplit {
		const
			{ children } = this,
			len = children.length
		if (len > 0) { return children[0] }
		const
			{ left, top, right, bottom } = this,
			freespace_child = constructFrom(this, left, top, right, bottom)
		children.push(freespace_child)
		return freespace_child
	}

	splitChildLeft(
		width: AnyLength,
		margin: DimensionXValue = {},
	) {
		margin.left ??= 0
		margin.right ??= 0
		const
			freespace = this.getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getWidth, setWidth] = createStateIfPrimitive(parseLengthUnit(width)),
			[getMargin, setMargin] = createStateIfPrimitive({ ...margin, top: 0, bottom: 0 } as MarginValue),
			child_left = createMemo((id) => {
				const { left: ml = 0, right: mr = 0 } = getMargin(id)
				return min(left(id) + ml, right(id) - mr)
			}),
			child_right = createMemo((id) => {
				const
					{ left: ml = 0, right: mr = 0 } = getMargin(id),
					l = left(id) + ml,
					r = max(right(id) - mr, l),
					t = top(id),
					b = bottom(id),
					{ px = 0, vw = 0, vh = 0 } = getWidth(id)
				return min(l + px + (r - l) * vw + (b - t) * vh, r)
			}),
			child_framesplit = constructFrom(this, child_left, top, child_right, bottom)
		child_framesplit.margin = getMargin
		child_framesplit.width = getWidth
		child_framesplit.set.margin = setMargin
		child_framesplit.set.width = setWidth
		freespace.left = createMemo((id) => min(child_right(id) + getMargin(id).right, right(id)))
		this.children.push(child_framesplit)
		return child_framesplit
	}

	splitChildTop(
		height: AnyLength,
		margin: DimensionYValue = {},
	) {
		margin.top ??= 0
		margin.bottom ??= 0
		const
			freespace = this.getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getHeight, setHeight] = createStateIfPrimitive(parseLengthUnit(height)),
			[getMargin, setMargin] = createStateIfPrimitive({ ...margin, left: 0, right: 0 } as MarginValue),
			child_top = createMemo((id) => {
				const { top: mt = 0, bottom: mb = 0 } = getMargin(id)
				return min(top(id) + mt, bottom(id) - mb)
			}),
			child_bottom = createMemo((id) => {
				const
					{ top: mt = 0, bottom: mb = 0 } = getMargin(),
					l = left(id),
					r = right(id),
					t = top(id) + mt,
					b = max(bottom(id) - mb, t),
					{ px = 0, vw = 0, vh = 0 } = getHeight(id)
				return min(t + px + (r - l) * vw + (b - t) * vh, b)
			}),
			child_framesplit = constructFrom(this, left, child_top, right, child_bottom)
		child_framesplit.margin = getMargin
		child_framesplit.height = getHeight
		child_framesplit.set.margin = setMargin
		child_framesplit.set.height = setHeight
		freespace.top = createMemo((id) => min(child_bottom(id) + getMargin(id).bottom, bottom(id)))
		this.children.push(child_framesplit)
		return child_framesplit
	}

	splitChildRight(
		width: AnyLength,
		margin: DimensionXValue = {},
	) {
		margin.left ??= 0
		margin.right ??= 0
		const
			freespace = this.getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getWidth, setWidth] = createStateIfPrimitive(parseLengthUnit(width)),
			[getMargin, setMargin] = createStateIfPrimitive({ ...margin, top: 0, bottom: 0 } as MarginValue),
			child_left = createMemo((id) => {
				const
					{ left: ml = 0, right: mr = 0 } = getMargin(id),
					l = left(id) + ml,
					r = max(right(id) - mr, l),
					t = top(id),
					b = bottom(id),
					{ px = 0, vw = 0, vh = 0 } = getWidth(id)
				return max(r - px - (r - l) * vw - (b - t) * vh, l)
			}),
			child_right = createMemo((id) => {
				const { left: ml = 0, right: mr = 0 } = getMargin(id)
				return max(left(id) + ml, right(id) - mr)
			}),
			child_framesplit = constructFrom(this, child_left, top, child_right, bottom)
		child_framesplit.margin = getMargin
		child_framesplit.width = getWidth
		child_framesplit.set.margin = setMargin
		child_framesplit.set.width = setWidth
		freespace.right = createMemo((id) => max(child_left(id) + getMargin(id).left, left(id)))
		this.children.push(child_framesplit)
		return child_framesplit
	}

	splitChildBottom(
		height: AnyLength,
		margin: DimensionYValue = {},
	) {
		margin.top ??= 0
		margin.bottom ??= 0
		const
			freespace = this.getFreespaceChild(),
			{ left, top, right, bottom } = freespace,
			[getHeight, setHeight] = createStateIfPrimitive(parseLengthUnit(height)),
			[getMargin, setMargin] = createStateIfPrimitive({ ...margin, left: 0, right: 0 } as MarginValue),
			child_top = createMemo((id) => {
				const
					{ top: mt = 0, bottom: mb = 0 } = getMargin(id),
					l = left(id),
					r = right(id),
					t = top(id) + mt,
					b = max(bottom(id) - mb, t),
					{ px = 0, vw = 0, vh = 0 } = getHeight(id)
				return max(b - px - (r - l) * vw - (b - t) * vh, t)
			}),
			child_bottom = createMemo((id) => {
				const { top: mt = 0, bottom: mb = 0 } = getMargin(id)
				return max(top(id) + mt, bottom(id) - mb)
			}),
			child_framesplit = constructFrom(this, left, child_top, right, child_bottom)
		child_framesplit.margin = getMargin
		child_framesplit.height = getHeight
		child_framesplit.set.margin = setMargin
		child_framesplit.set.height = setHeight
		freespace.bottom = createMemo((id) => max(child_top(id) + getMargin(id).top, top(id)))
		this.children.push(child_framesplit)
		return child_framesplit
	}

	/** hit test to see if this frame, or any of its deep children, get hit by the `(x, y)` coordinates. <br>
	 * the deepest child hit by the hit ray will be returned, and an `undefined` will be returned if nothing was hit.
	*/
	hit(x: number, y: number): FrameSplit | undefined {
		// first see if `this` is hit by the `(x, y)` point
		if (this.left() <= x && x <= this.right() && this.top() <= y && y <= this.bottom()) {
			// now, check if any child (besides freespace `children[0]`) also gets hit
			// if yes, then that child should be prioritized and returned, else return `this` itself
			const
				children = this.children,
				children_len = children.length
			let
				deep_child_that_has_been_hit: FrameSplit | undefined,
				i = 0
			while (++i < children_len) {
				if (deep_child_that_has_been_hit = children[i].hit(x, y)) {
					break
				}
			}
			return deep_child_that_has_been_hit ?? this
		}
		// if `(x, y)` is out of bounds for `this`, then return an undefined
		return
	}

	toString(): Object {
		const
			{ left, top, right, bottom, margin, width, height, set, children } = this,
			setters: string[] = [],
			obj: { [prop: string]: any } = {
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

	toPreview(ctx: CanvasRenderingContext2D, color?: string) {
		const
			children = this.children,
			children_len = children.length
		if (children_len <= 1 || color) {
			const
				{ left, top, right, bottom } = this,
				x = left(),
				y = top(),
				w = right() - x,
				h = bottom() - y
			ctx.fillStyle = color ?? pick_color_iter.next().value
			ctx.fillRect(x, y, w, h)
		}
		for (let ch = 0; ch < children_len; ch++) {
			children[ch].toPreview(ctx, ch === 0 ? (color ?? "gray") : undefined)
		}
	}
}


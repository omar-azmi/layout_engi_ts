import { cumulativeSum, math_abs, math_cos, math_sin, number_isFinite } from "./deps.ts"
import { SizedRect } from "./typedefs.ts"
import { AlignOption, AnyLength, LengthUnit, LengthUnitLiteral, UnitNumber } from "./typedefs.ts"


/// Grid related functions

/** converts an alignment string {@link AlignOption | `AlignOption`} to a {@link UnitNumber | unit number}. <br>
 * - `"start"` is parsed as `0`
 * - `"center"` is parsed as `0.5`
 * - `"end"` is parsed as `1`
 * - `number` is left as is
 * 
 * if `reverse` is `true`, then `1 - the_result` is returned, so that `"start"` behaves like `"end"`, and vice versa.
*/
export const alignmentToNumber = (alignment: AlignOption, reverse: boolean = false): UnitNumber => {
	if (typeof alignment === "string") {
		alignment = alignment === "start" ? 0 : alignment === "end" ? 1 : 0.5
	}
	return reverse ? 1 - alignment : alignment
}

/** convert an array of {@link AlignOption | align options} to an array of {@link UnitNumber | unit numbers}. <br>
 * see the {@link alignmentToNumber | `alignmentToNumber`} function for more details.
*/
export const parseAlignments = (alignments: AlignOption | AlignOption[], reverse: boolean = false): UnitNumber[] => {
	alignments = Array.isArray(alignments) ? alignments : [alignments]
	return alignments.map((v) => alignmentToNumber(v, reverse))
}

/** a cumulative numeric sum that excludes the last number in the sum.
 * @example
 * ```ts
 * zeroCumulativeSum([10, 20, 30, 40, 50]) // returns [0, 10, 30, 60, 100]
 * ```
*/
export const zeroCumulativeSum = (arr: number[]): number[] => {
	const cum_sum = cumulativeSum(arr)
	cum_sum.pop()
	return cum_sum
}

/** get the bounding box width and height of a rectangle that has been rotated at its center */
export const boundboxOfRotatedRect = (width: number, height: number, rotation?: number): SizedRect => {
	if (!rotation) { return { width, height } }
	const
		abs_cos_rot = math_abs(math_cos(rotation)),
		abs_sin_rot = math_abs(math_sin(rotation))
	return {
		width: width * abs_cos_rot + height * abs_sin_rot,
		height: width * abs_sin_rot + height * abs_cos_rot
	}
}


/// FrameSplit related functions

const parseLengthUnitLiteral = (str: LengthUnitLiteral): LengthUnit => {
	const length_units: Required<LengthUnit> = { px: 0, pw: 0, ph: 0 }
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

const length_unit_name_iter = ["px", "pw", "ph"] as const
export const stringifyLengthUnit = (length: AnyLength): LengthUnitLiteral => {
	const length_unit = parseLengthUnit(length)
	return length_unit_name_iter.map(
		(unit_name) => (String(length_unit[unit_name] ?? 0) + unit_name)
	).join(" + ") as LengthUnitLiteral
}

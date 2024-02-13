import type { Array2DRowMajor } from "https://deno.land/x/kitchensink_ts@v0.7.2/array2d.ts"
export { Array2DShape, rotateArray2DMajor, rotateArray2DMinor, spliceArray2DMajor, spliceArray2DMinor, transposeArray2D } from "https://deno.land/x/kitchensink_ts@v0.7.2/array2d.ts"
export type { Array2D, Array2DColMajor, Array2DRowMajor } from "https://deno.land/x/kitchensink_ts@v0.7.2/array2d.ts"
export { dom_clearTimeout, dom_setTimeout, noop, number_POSITIVE_INFINITY } from "https://deno.land/x/kitchensink_ts@v0.7.2/builtin_aliases_deps.ts"
export { THROTTLE_REJECT, TIMEOUT, debounce, promiseTimeout, throttle, throttleAndTrail } from "https://deno.land/x/kitchensink_ts@v0.7.2/lambda.ts"
export { cumulativeSum } from "https://deno.land/x/kitchensink_ts@v0.7.2/numericarray.ts"
export { clamp, max, min, sum } from "https://deno.land/x/kitchensink_ts@v0.7.2/numericmethods.ts"
export { constructFrom, constructorOf } from "https://deno.land/x/kitchensink_ts@v0.7.2/struct.ts"
export type { ConstructorOf, MethodsOf } from "https://deno.land/x/kitchensink_ts@v0.7.2/typedefs.ts"
export { Context, MemoSignal_Factory, StateSignal_Factory, default_equality, falsey_equality, throttlingEquals } from "https://deno.land/x/tsignal_ts@v0.1.2-c/mod.ts"
export type { Accessor, EqualityCheck, EqualityFn, Setter } from "https://deno.land/x/tsignal_ts@v0.1.2-c/mod.ts"

export const number_isFinite = Number.isFinite
export const object_entries = Object.entries
export const object_fromEntries = Object.fromEntries
export const {
	abs: math_abs,
	cos: math_cos,
	max: math_max,
	sin: math_sin,
	random: math_random,
} = Math

// TODO: add to kitchensink_ts
/** shuffle an array via mutation. the ordering of elements will be randomized by the end. */
export const shuffleArray = <T>(arr: Array<T>): Array<T> => {
	const
		len = arr.length,
		rand_int = () => (math_random() * len) | 0,
		swap = (i1: number, i2: number) => {
			const temp = arr[i1]
			arr[i1] = arr[i2]
			arr[i2] = temp
		}
	for (let i = 0; i < len; i++) swap(i, rand_int())
	return arr
}

export const newArray2D = <T>(rows: number, cols: number, fill?: T): Array2DRowMajor<T> => {
	return Array(rows).fill(undefined).map(() => Array(cols).fill(fill))
}

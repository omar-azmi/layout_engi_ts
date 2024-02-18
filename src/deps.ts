import type { Array2DRowMajor } from "https://deno.land/x/kitchensink_ts@v0.7.3/array2d.ts"
import { array_isEmpty } from "https://deno.land/x/kitchensink_ts@v0.7.3/builtin_aliases_deps.ts"
import { max } from "https://deno.land/x/kitchensink_ts@v0.7.3/numericmethods.ts"
export { Array2DShape, rotateArray2DMajor, rotateArray2DMinor, spliceArray2DMajor, spliceArray2DMinor, transposeArray2D } from "https://deno.land/x/kitchensink_ts@v0.7.3/array2d.ts"
export type { Array2D, Array2DColMajor, Array2DRowMajor } from "https://deno.land/x/kitchensink_ts@v0.7.3/array2d.ts"
export { dom_clearTimeout, dom_setTimeout, noop, number_POSITIVE_INFINITY } from "https://deno.land/x/kitchensink_ts@v0.7.3/builtin_aliases_deps.ts"
export { THROTTLE_REJECT, TIMEOUT, debounce, promiseTimeout, throttle, throttleAndTrail } from "https://deno.land/x/kitchensink_ts@v0.7.3/lambda.ts"
export { cumulativeSum } from "https://deno.land/x/kitchensink_ts@v0.7.3/numericarray.ts"
export { clamp, max, min, sum } from "https://deno.land/x/kitchensink_ts@v0.7.3/numericmethods.ts"
export { constructFrom, constructorOf } from "https://deno.land/x/kitchensink_ts@v0.7.3/struct.ts"
export type { ConstructorOf, MethodsOf } from "https://deno.land/x/kitchensink_ts@v0.7.3/typedefs.ts"
export { Context, MemoSignal_Factory, StateSignal_Factory, default_equality, falsey_equality, throttlingEquals } from "https://deno.land/x/tsignal_ts@v0.2.1/mod.ts"
export type { Accessor, EqualityCheck, EqualityFn, Setter } from "https://deno.land/x/tsignal_ts@v0.2.1/mod.ts"

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

export const newArray2D = <T>(rows: number, cols: number, fill_fn?: T | ((value?: undefined, column_index?: number, column_array?: (T | undefined)[]) => T)): Array2DRowMajor<T> => {
	const col_map_fn = typeof fill_fn === "function" ?
		() => Array(cols).fill(undefined).map(fill_fn as () => T) :
		() => Array(cols).fill(fill_fn)
	return Array(rows).fill(undefined).map(col_map_fn)
}

// TODO: add to kitchensink_ts
/** a generator that yields random selected non-repeating elements out of an array.
 * once the all elements have been yielded, a cycle has been completed.
 * after a cycle is completed the iterator resets to a new cycle, yielding randomly selected elements once again.
 * the ordering of the randomly yielded elements will also differ from compared to the first time. <br>
 * moreover, you can call the iterator with an optional number argument that specifies if you wish to skip ahead a certain number of elements.
 * - `1`: go to next element (default behavior)
 * - `0`: receive the same element as before
 * - `-1`: go to previous next element
 * - `+ve number`: skip to next `number` of elements
 * - `-ve number`: go back `number` of elements
 * 
 * note that once a cycle is complete, going back won't restore the correct element from the previous cycle, because the info about the previous cycle gets lost.
*/
export const shuffledDeque = function* <T>(arr: Array<T>): Generator<T, void, number | undefined> {
	let i = arr.length // this is only temporary. `i` immediately becomes `0` when the while loop begins
	while (!array_isEmpty(arr)) {
		if (i >= arr.length) {
			i = 0
			shuffleArray(arr)
		}
		i = max(i + ((yield arr[i]) ?? 1), 0)
	}
}

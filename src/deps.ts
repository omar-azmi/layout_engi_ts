export { Array2DShape, rotateArray2DMajor, rotateArray2DMinor, spliceArray2DMajor, spliceArray2DMinor, transposeArray2D } from "https://deno.land/x/kitchensink_ts@v0.7.2/array2d.ts"
export type { Array2D, Array2DColMajor, Array2DRowMajor } from "https://deno.land/x/kitchensink_ts@v0.7.2/array2d.ts"
export { debounce, throttle, throttleAndTrail } from "https://deno.land/x/kitchensink_ts@v0.7.2/lambda.ts"
export { cumulativeSum } from "https://deno.land/x/kitchensink_ts@v0.7.2/numericarray.ts"
export { max, min, sum } from "https://deno.land/x/kitchensink_ts@v0.7.2/numericmethods.ts"
export { constructFrom, constructorOf } from "https://deno.land/x/kitchensink_ts@v0.7.2/struct.ts"
export type { ConstructorOf, MethodsOf } from "https://deno.land/x/kitchensink_ts@v0.7.2/typedefs.ts"
export { Context, MemoSignal_Factory, StateSignal_Factory } from "https://deno.land/x/tsignal_ts@v0.1.2-c/mod.ts"
export type { Accessor, Setter } from "https://deno.land/x/tsignal_ts@v0.1.2-c/mod.ts"

export const number_isFinite = Number.isFinite
export const object_entries = Object.entries
export const object_fromEntries = Object.fromEntries
export const {
	abs: math_abs,
	cos: math_cos,
	max: math_max,
	sin: math_sin,
} = Math

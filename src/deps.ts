export { Array2DShape, newArray2D, rotateArray2DMajor, rotateArray2DMinor, shuffleArray, shuffledDeque, spliceArray2DMajor, spliceArray2DMinor, transposeArray2D } from "jsr:@oazmi/kitchensink@0.7.5/array2d"
export type { Array2D, Array2DColMajor, Array2DRowMajor } from "jsr:@oazmi/kitchensink@0.7.5/array2d"
export { dom_clearInterval, dom_clearTimeout, dom_setInterval, dom_setTimeout, math_random, noop, number_POSITIVE_INFINITY, number_isFinite, object_entries, object_fromEntries } from "jsr:@oazmi/kitchensink@0.7.5/builtin_aliases_deps"
export { THROTTLE_REJECT, TIMEOUT, debounce, promiseTimeout, throttle, throttleAndTrail } from "jsr:@oazmi/kitchensink@0.7.5/lambda"
export { cumulativeSum } from "jsr:@oazmi/kitchensink@0.7.5/numericarray"
export { clamp, max, min, sum } from "jsr:@oazmi/kitchensink@0.7.5/numericmethods"
export { constructFrom, constructorOf } from "jsr:@oazmi/kitchensink@0.7.5/struct"
export type { ConstructorOf, MethodsOf } from "jsr:@oazmi/kitchensink@0.7.5/typedefs"
export { Context, EffectSignal_Factory, LazySignal_Factory, MemoSignal_Factory, StateSignal_Factory, default_equality, falsey_equality, throttlingEquals } from "jsr:@oazmi/tsignal@0.3.2"
export type { Accessor, EqualityCheck, EqualityFn, Setter } from "jsr:@oazmi/tsignal@0.3.2"

export const {
	abs: math_abs,
	cos: math_cos,
	max: math_max,
	sin: math_sin,
} = Math

export const enum DEBUG {
	LOG = 0,
	ERROR = 0,
	ASSERT = 0,
}

// DONE: add build scripts and workflow files and workspace files from kitchensink_ts
// TODO: add a readme and a license file

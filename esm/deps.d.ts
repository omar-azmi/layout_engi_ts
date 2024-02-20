export { Array2DShape, rotateArray2DMajor, rotateArray2DMinor, spliceArray2DMajor, spliceArray2DMinor, transposeArray2D } from "kitchensink_ts/array2d";
export type { Array2D, Array2DColMajor, Array2DRowMajor } from "kitchensink_ts/array2d";
export { dom_clearInterval, dom_clearTimeout, dom_setInterval, dom_setTimeout, noop, number_POSITIVE_INFINITY, object_entries, object_fromEntries } from "kitchensink_ts/builtin_aliases_deps";
export { THROTTLE_REJECT, TIMEOUT, debounce, promiseTimeout, throttle, throttleAndTrail } from "kitchensink_ts/lambda";
export { cumulativeSum } from "kitchensink_ts/numericarray";
export { clamp, max, min, sum } from "kitchensink_ts/numericmethods";
export { constructFrom, constructorOf } from "kitchensink_ts/struct";
export type { ConstructorOf, MethodsOf } from "kitchensink_ts/typedefs";
export { Context, EffectSignal_Factory, LazySignal_Factory, MemoSignal_Factory, StateSignal_Factory, default_equality, falsey_equality, throttlingEquals } from "tsignal_ts";
export type { Accessor, EqualityCheck, EqualityFn, Setter } from "tsignal_ts";
export declare const number_isFinite: (number: unknown) => boolean;
export declare const math_abs: (x: number) => number, math_cos: (x: number) => number, math_max: (...values: number[]) => number, math_sin: (x: number) => number, math_random: () => number;
export declare const enum DEBUG {
    LOG = 0,
    ERROR = 0,
    ASSERT = 0
}
/** shuffle an array via mutation. the ordering of elements will be randomized by the end. */
export declare const shuffleArray: <T>(arr: T[]) => T[];
export declare const newArray2D: <T>(rows: number, cols: number, fill_fn?: T | ((value?: undefined, column_index?: number, column_array?: (T | undefined)[] | undefined) => T) | undefined) => Array2DRowMajor<T>;
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
export declare const shuffledDeque: <T>(arr: T[]) => Generator<T, void, number | undefined>;

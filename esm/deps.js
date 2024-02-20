import { array_isEmpty } from "kitchensink_ts/builtin_aliases_deps";
import { max } from "kitchensink_ts/numericmethods";
export { Array2DShape, rotateArray2DMajor, rotateArray2DMinor, spliceArray2DMajor, spliceArray2DMinor, transposeArray2D } from "kitchensink_ts/array2d";
export { dom_clearInterval, dom_clearTimeout, dom_setInterval, dom_setTimeout, noop, number_POSITIVE_INFINITY, object_entries, object_fromEntries } from "kitchensink_ts/builtin_aliases_deps";
export { THROTTLE_REJECT, TIMEOUT, debounce, promiseTimeout, throttle, throttleAndTrail } from "kitchensink_ts/lambda";
export { cumulativeSum } from "kitchensink_ts/numericarray";
export { clamp, max, min, sum } from "kitchensink_ts/numericmethods";
export { constructFrom, constructorOf } from "kitchensink_ts/struct";
export { Context, EffectSignal_Factory, LazySignal_Factory, MemoSignal_Factory, StateSignal_Factory, default_equality, falsey_equality, throttlingEquals } from "tsignal_ts";
export const number_isFinite = Number.isFinite;
export const { abs: math_abs, cos: math_cos, max: math_max, sin: math_sin, random: math_random, } = Math;
export var DEBUG;
(function (DEBUG) {
    DEBUG[DEBUG["LOG"] = 0] = "LOG";
    DEBUG[DEBUG["ERROR"] = 0] = "ERROR";
    DEBUG[DEBUG["ASSERT"] = 0] = "ASSERT";
})(DEBUG || (DEBUG = {}));
// DONE: add build scripts and workflow files and workspace files from kitchensink_ts
// TODO: add a readme and a license file
// TODO: add to kitchensink_ts
/** shuffle an array via mutation. the ordering of elements will be randomized by the end. */
export const shuffleArray = (arr) => {
    const len = arr.length, rand_int = () => (math_random() * len) | 0, swap = (i1, i2) => {
        const temp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = temp;
    };
    for (let i = 0; i < len; i++)
        swap(i, rand_int());
    return arr;
};
export const newArray2D = (rows, cols, fill_fn) => {
    const col_map_fn = typeof fill_fn === "function" ?
        () => Array(cols).fill(undefined).map(fill_fn) :
        () => Array(cols).fill(fill_fn);
    return Array(rows).fill(undefined).map(col_map_fn);
};
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
export const shuffledDeque = function* (arr) {
    let i = arr.length; // this is only temporary. `i` immediately becomes `0` when the while loop begins
    while (!array_isEmpty(arr)) {
        if (i >= arr.length) {
            i = 0;
            shuffleArray(arr);
        }
        i = max(i + ((yield arr[i]) ?? 1), 0);
    }
};

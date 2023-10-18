export { Array2DShape, rotateArray2DMajor, rotateArray2DMinor, spliceArray2DMajor, spliceArray2DMinor, transposeArray2D } from "https://deno.land/x/kitchensink_ts@v0.7.1/array2d.ts"
export type { Array2D, Array2DColMajor, Array2DRowMajor } from "https://deno.land/x/kitchensink_ts@v0.7.1/array2d.ts"
export { debounce, throttle, throttleAndTrail } from "https://deno.land/x/kitchensink_ts@v0.7.1/lambda.ts"
export { cumulativeSum } from "https://deno.land/x/kitchensink_ts@v0.7.1/numericarray.ts"
export { max, min, sum } from "https://deno.land/x/kitchensink_ts@v0.7.1/numericmethods.ts"
export { constructFrom, constructorOf } from "https://deno.land/x/kitchensink_ts@v0.7.1/struct.ts"
export type { ConstructorOf, MethodsOf } from "https://deno.land/x/kitchensink_ts@v0.7.1/typedefs.ts"
//export * from "https://deno.land/x/kitchensink_ts@v0.7.1/builtin_aliases.ts"

//export * from "https://esm.sh/solid-js?d.ts"
//export type * from "https://esm.sh/solid-js?d.ts"
//export * from "file:///D:/My works/2022/deno_rewrites/kitchensink_ts/src/signal.ts"
export { Context, MemoSignal_Factory, StateSignal_Factory } from "https://deno.land/x/tsignal_ts@v0.1.1/mod.ts"
export type { Accessor, Setter } from "https://deno.land/x/tsignal_ts@v0.1.1/mod.ts"

//export {} from "https://deno.land/x/kitchensink_ts/builtin_aliases_deps.ts"
export const number_isFinite = Number.isFinite
//export const document_createElement = document.createElement
export const object_entries = Object.entries
export const object_fromEntries = Object.fromEntries

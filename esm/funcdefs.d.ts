import { SizedRect } from "./typedefs.js";
import { AlignOption, AnyLength, LengthUnit, LengthUnitLiteral, UnitNumber } from "./typedefs.js";
/** converts an alignment string {@link AlignOption | `AlignOption`} to a {@link UnitNumber | unit number}. <br>
 * - `"start"` is parsed as `0`
 * - `"center"` is parsed as `0.5`
 * - `"end"` is parsed as `1`
 * - `number` is left as is
 *
 * if `reverse` is `true`, then `1 - the_result` is returned, so that `"start"` behaves like `"end"`, and vice versa.
*/
export declare const alignmentToNumber: (alignment: AlignOption, reverse?: boolean) => UnitNumber;
/** convert an array of {@link AlignOption | align options} to an array of {@link UnitNumber | unit numbers}. <br>
 * see the {@link alignmentToNumber | `alignmentToNumber`} function for more details.
*/
export declare const parseAlignments: (alignments: AlignOption | AlignOption[], reverse?: boolean) => UnitNumber[];
/** a cumulative numeric sum that excludes the last number in the sum.
 * @example
 * ```ts
 * zeroCumulativeSum([10, 20, 30, 40, 50]) // returns [0, 10, 30, 60, 100]
 * ```
*/
export declare const zeroCumulativeSum: (arr: number[]) => number[];
/** get the bounding box width and height of a rectangle that has been rotated at its center */
export declare const boundboxOfRotatedRect: (width: number, height: number, rotation?: number) => SizedRect;
export declare const parseLengthUnit: (length: AnyLength) => Partial<LengthUnit>;
export declare const stringifyLengthUnit: (length: AnyLength) => LengthUnitLiteral;

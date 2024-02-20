/** this module provides you with the {@link FrameSplit | `FrameSplit`} class, which lets you create a
 * reactive frame (box) that can be recursively split from any of its 4-sides.
 *
 * @example
 * ```ts
 * // TODO
 * ```
 *
 * @module
*/
import { Accessor, Setter } from "./signal.js";
import { AnyLength, AnyNumber, Hit, LengthUnit } from "./typedefs.js";
interface DimensionXValue {
    left?: number;
    right?: number;
}
interface DimensionYValue {
    top?: number;
    bottom?: number;
}
interface DimensionXGetter {
    left?: Accessor<number>;
    right?: Accessor<number>;
}
interface DimensionYGetter {
    top?: Accessor<number>;
    bottom?: Accessor<number>;
}
interface DimensionXSetter {
    left?: Setter<number>;
    right?: Setter<number>;
}
interface DimensionYSetter {
    top?: Setter<number>;
    bottom?: Setter<number>;
}
export type MarginConfig = DimensionXValue & DimensionYValue;
export type MarginValue = Required<MarginConfig>;
export type MarginGetter = Accessor<MarginValue>;
export type MarginSetter = Setter<MarginValue>;
export declare const pick_color_iter: Generator<string, void, number | undefined>;
export declare class FrameSplit implements Required<DimensionXGetter & DimensionYGetter>, Hit<FrameSplit> {
    left: Accessor<number>;
    top: Accessor<number>;
    right: Accessor<number>;
    bottom: Accessor<number>;
    margin?: MarginGetter;
    width?: Accessor<LengthUnit>;
    height?: Accessor<LengthUnit>;
    set: (DimensionXSetter & DimensionYSetter) & {
        margin?: MarginSetter;
        width?: Setter<LengthUnit>;
        height?: Setter<LengthUnit>;
    };
    children: FrameSplit[];
    constructor(left: AnyNumber, top: AnyNumber, right: AnyNumber, bottom: AnyNumber);
    getFreespaceChild(): FrameSplit;
    splitChildLeft(width: AnyLength, margin?: DimensionXValue): any;
    splitChildTop(height: AnyLength, margin?: DimensionYValue): any;
    splitChildRight(width: AnyLength, margin?: DimensionXValue): any;
    splitChildBottom(height: AnyLength, margin?: DimensionYValue): any;
    /** hit test to see if this frame, or any of its deep children, get hit by the `(x, y)` coordinates. <br>
     * the deepest child hit by the hit ray will be returned, and an `undefined` will be returned if nothing was hit.
    */
    hit(x: number, y: number): FrameSplit | undefined;
    toString(): Object;
    toPreview(ctx: CanvasRenderingContext2D, color?: string): void;
}
export {};

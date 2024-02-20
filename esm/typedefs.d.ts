import { Accessor } from "./deps.js";
/** a number between 0 and 1 (inclusive) */
export type UnitNumber = number;
export interface SizedRect {
    /** width of a sprite or rectangle. */
    width: number;
    /** height of a sprite or rectangle. */
    height: number;
}
export interface PositionedRect {
    /** x-position of a sprite or a rectangle, relative to its parent container. */
    x: number;
    /** y-position of a sprite or a rectangle, relative to its parent container. */
    y: number;
}
export interface RotatedRect {
    /** describes clockwise-rotation of a rectangle relative to its own center in radians.
     * the rotation should be applied *after* the rectangle has been positioned at its `(x, y)` coordinates. <br>
     * the constraint for rotating about the center is enforced so that the positioning of the rectangle is invariant to the choice of the rotation. <br>
     * the constraint for applying the rotation *after* positioning it, is enforced so that there is no ambiguity in the ordering of the two procedures.
    */
    rotation: number;
}
export type Sprite = SizedRect & PositionedRect & Partial<RotatedRect>;
/** an abstract interface implemented by layout classes that support hit tests. */
export interface Hit<T> {
    /** an abstraction of the hit method. */
    hit(x: number, y: number): T | undefined;
}
/** an abstract interface implemented by layout classes that support rendering (possibly just for the sake of debugging). */
export interface Render {
    render(ctx: CanvasRenderingContext2D): void;
}
/** alignment position of a cell's sprite within grid's cell */
export type AlignOption = UnitNumber | "start" | "center" | "end";
export type CombinationLiteral<A extends string, B extends string, SEP extends string> = A | `${A}${SEP}${B}` | `${B}${SEP}${A}` | B;
type OriginVerticalAlignSingleOption = "top" | "bottom";
type OriginHorizontalAlignSingleOption = "left" | "right";
type OriginAlignDelimiter = "-" | "";
export type OriginAlignOption = "" | CombinationLiteral<OriginVerticalAlignSingleOption, OriginHorizontalAlignSingleOption, OriginAlignDelimiter>;
export type AnyNumber = number | Accessor<number>;
type PixelUnitLiteral = `${number}px`;
type ParentWidthUnitLiteral = `${number}pw`;
type ParentHeightUnitLiteral = `${number}ph`;
/** string representation of the equivalent length-unit object {@link LengthUnit | `LengthUnit`} */
export type LengthUnitLiteral = CombinationLiteral<PixelUnitLiteral, CombinationLiteral<ParentWidthUnitLiteral, ParentHeightUnitLiteral, "+">, "+">;
/** object representation of a length-unit to be used within a `FrameSplit`. */
export interface LengthUnit {
    /** length in pixels */
    px?: number;
    /** fraction of length relative to parent frame's width */
    pw?: number;
    /** fraction of length relative to parent frame's height */
    ph?: number;
}
/** the length description of a certain frame `FrameSplit` */
export type AnyLength = LengthUnit | LengthUnitLiteral | number | `{number}`;
export {};

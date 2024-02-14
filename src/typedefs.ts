import { Accessor } from "./deps.ts"

/** a number between 0 and 1 (inclusive) */
export type UnitNumber = number


/// Grid related

/** alignment position of a cell's sprite within grid's cell */
export type AlignOption = UnitNumber | "start" | "center" | "end"

export type CombinationLiteral<A extends string, B extends string, SEP extends string> = A | `${A}${SEP}${B}` | `${B}${SEP}${A}` | B

type OriginVerticalAlignSingleOption = "top" | "bottom"
type OriginHorizontalAlignSingleOption = "left" | "right"
type OriginAlignDelimiter = "-" | ""
export type OriginAlignOption = "" | CombinationLiteral<OriginVerticalAlignSingleOption, OriginHorizontalAlignSingleOption, OriginAlignDelimiter>


/// FrameSplit related

export type AnyNumber = number | Accessor<number>
type PixelUnitLiteral = `${number}px`
type ParentWidthUnitLiteral = `${number}pw`
type ParentHeightUnitLiteral = `${number}ph`

/** string representation of the equivalent length-unit object {@link LengthUnit | `LengthUnit`} */
export type LengthUnitLiteral = CombinationLiteral<PixelUnitLiteral, CombinationLiteral<ParentWidthUnitLiteral, ParentHeightUnitLiteral, "+">, "+">

/** object representation of a length-unit to be used within a `FrameSplit`. */
export interface LengthUnit {
	/** length in pixels */
	px?: number
	/** fraction of length relative to parent frame's width */
	pw?: number
	/** fraction of length relative to parent frame's height */
	ph?: number
}

/** the length description of a certain frame `FrameSplit` */
export type AnyLength = LengthUnit | LengthUnitLiteral | number | `{number}`

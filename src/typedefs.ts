export interface SpriteRect {
	/** spirit's (unrotated) x-position relative frame's top-left position */
	x: number
	/** spirit's (unrotated) y-position relative frame's top-left position */
	y: number
	/** spirit's width */
	width: number
	/** spirit's height */
	height: number
}

/** single content info (ie a sprit's info) */
export interface SCInfo extends SpriteRect {
	/** spirit's rotation relative to its own center. setting a rotation will not alter {@link SpriteRect.x} and {@link SpriteRect.y}, thanks to the center position's invariance */
	rotation?: number
}

/** a zero-content frame (ie a pure frame). it is here merely for extending. */
export interface FrameZCInfo {
	/** rectangular frame's left position (x-coordinates) */
	left: number
	/** rectangular frame's top position (y-coordinates) */
	top: number
	/** rectangular frame's right position (x-coordinates) */
	right: number
	/** rectangular frame's bottom position (y-coordinates) */
	bottom: number
}

export const
	FrameSCKind = Symbol("single_component_frame"),
	FrameMCKind = Symbol("multi_component_frame")

/** a single-content frame (the content info gets inlined instead of being nested, in contrast to {@link FrameMCInfo}) */
export type FrameSCInfo = FrameZCInfo & SCInfo & { kind: typeof FrameSCKind }

/** a multi-content content frame (the content info is stored in the {@link FrameMCInfo.content} array) */
export interface FrameMCInfo extends FrameZCInfo {
	kind: typeof FrameMCKind
	/** child content */
	content: SCInfo[]
}

/** a number between 0 and 1 (inclusive) */
type UnitNumber = number
type AlignOption = UnitNumber | "start" | "center" | "end"



/** an object describing the frame allotted to a sprite <br>
 * the {@link left}, {@link top}, {@link right}, and {@link bottom} properties tell you the 4 edges of the frame, relative to the parent {@link FrameInfo}'s (`x`, `y`) position (if any) <br>
 * the {@link x} and {@link y} properties tell you the sprite's rectangle's unrotated top-left position relative to this cell's frame's top-left position (ie relative to {@link top} and {@link left}) <br>
 * the {@link width} and {@link height} properties tell you the sprite's rectangle's unrotated width and height <br>
 * the {@link rotation} property tells you how much rotation (in radians) to apply to the center of the sprite.
 * the rotation is about the sprite's center so that it does not alter {@link x} and {@link y} no matter its value. (ie the three properties {@link x}, {@link y}, and {@link rotation} are independant of each other or invariants)
*/
interface FrameInfo {
	/** rectangular frame's left position (x-coordinates) */
	left: number
	/** rectangular frame's top position (y-coordinates) */
	top: number
	/** rectangular frame's right position (x-coordinates) */
	right: number
	/** rectangular frame's bottom position (y-coordinates) */
	bottom: number
	/** spirit's (unrotated) x-position relative frame's top-left position */
	x: number
	/** spirit's (unrotated) y-position relative frame's top-left position */
	y: number
	/** spirit's width */
	width: number
	/** spirit's height */
	height: number
	/** spirit's rotation relative to its own center. setting a rotation will not alter {@link x} and {@link y}, thanks to the center position's invariance */
	rotation?: number
}

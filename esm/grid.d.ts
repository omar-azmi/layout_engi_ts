/** this module provides you with the {@link Grid | `Grid`} class, which lets you compute the positions of cells within a grid layout.
 *
 * @example
 * ```ts
 * // TODO
 * ```
 *
 * @module
*/
import { Array2DColMajor, Array2DRowMajor } from "./deps.js";
import { Accessor, SignalingClass } from "./signal.js";
import { AlignOption, Hit, OriginAlignOption, Sprite } from "./typedefs.js";
/** an object describing the frame allotted to a {@link GridCell | cell} within a {@link Grid | grid}. <br>
 * the {@link left}, {@link top}, {@link right}, and {@link bottom} properties tell you the 4 edges of the frame reserved specifically to your {@link GridCell | cell},
 * relative to the top-left position of the parent {@link Grid | grid}. <br>
 * the {@link x} and {@link y} properties tell you the sprite's rectangle's unrotated top-left position relative to this cell's frame's top-left position (ie relative to {@link top} and {@link left}). <br>
 * the {@link width} and {@link height} properties tell you the sprite's rectangle's unrotated width and height. <br>
 * the {@link rotation} property tells you how much rotation (in radians) to apply to the center of the sprite.
 * the rotation is about the sprite's center so that it does not alter {@link x} and {@link y} no matter its value. (ie the three properties {@link x}, {@link y}, and {@link rotation} are independent/invariant of each other).
*/
export interface CellFrameInfo extends Sprite {
    /** rectangular frame's left position (x-coordinates) relative to the parent {@link Grid | grid's left-coordinates}. */
    left: number;
    /** rectangular frame's top position (y-coordinates) relative to the parent {@link Grid | grid's top-coordinates}. */
    top: number;
    /** rectangular frame's right position (x-coordinates) relative to the parent {@link Grid | grid's left-coordinates}. */
    right: number;
    /** rectangular frame's bottom position (y-coordinates) relative to the parent {@link Grid | grid's top-coordinates}. */
    bottom: number;
    /** spirit's (unrotated) x-position relative to it's cellframe's {@link top}-{@link left} position. */
    x: number;
    /** spirit's (unrotated) y-position relative to it's cellframe's {@link top}-{@link left} position. */
    y: number;
    /** spirit's width */
    width: number;
    /** spirit's height */
    height: number;
    /** spirit's rotation relative to its own center. setting a rotation will not alter {@link x} and {@link y}, thanks to the center position's invariance. */
    rotation?: number;
}
/** sets the sizing and alignment configuration of a cell within a {@link Grid | `Grid`}. */
export interface GridCell {
    /** declare absolute width of cell. overrides parent {@link Grid | grid's} {@link Grid.rowAlign | `rowAlign`}, just for this child element. */
    width?: number;
    /** declare absolute height of cell. overrides parent {@link Grid | grid's} {@link Grid.colAlign | `colAlign`}, just for this child element. */
    height?: number;
    /** override parent {@link Grid | grid's} {@link Grid.rowAlign}, just for this child element. */
    rowAlign?: AlignOption;
    /** override parent {@link Grid | grid's} {@link Grid.colAlign}, just for this child element. */
    colAlign?: AlignOption;
    /** if an anchor is provided, then the point of alignment and justification on this child becomes the anchor, rather than the point set by {@link rowAlign | `rowAlign`} or {@link colAlign | `colAlign`}. */
    anchor?: {
        x?: number;
        y?: number;
    };
    /** rotation along the center. */
    rotation?: number;
}
/** initial options that customize {@link `Grid`}.
 * these options are also exposed as members of the {@link Grid | grid instance}, and may also be modified by the user.
 * however, you will need to call {@link Grid.setDirty | `setDirty`} method afterwards to have the layout computation rerun.
*/
export interface GridInit {
    /** initial number of columns in the grid. */
    cols: number;
    /** initial number of rows in the grid. */
    rows: number;
    /** control which corner the origin gets aligned to. default behavior is `"top-left"`. <br>
     * the origin is where the first-row-first-column item gets placed in.
     *
     * so if you were to set this option to `"right"`:
     * - the first-column will be positioned to the right-most location (instead of left-most),
     * - while the last-column will be positioned to the left-most position (instead of right-most) within the grid.
     *
     * and if you were to set this option to `"bottom-right"`:
     * - the first-row and first-column will be positioned to the bottom-right-most position (instead of top-left-most),
     * - while the last-row and last-column will be positioned to the top-left-most position (instead of bottom-right-most) within the grid.
    */
    originAlign?: OriginAlignOption;
    /** optional column-wise default width of empty cells. */
    colWidth?: number[];
    /** optional row-wise default height of empty cells. */
    rowHeight?: number[];
    /** optional column-wise minimum width of cells. */
    colMinWidth?: number[];
    /** optional row-wise minimum height of cells. */
    rowMinHeight?: number[];
    /** optional column-wise maximum width of cells. */
    colMaxWidth?: number[];
    /** optional row-wise maximum height of cells. */
    rowMaxHeight?: number[];
    /** optional column-wise horizontal-alignment option for the sprite within each cell's frame.
     * a numeric value between `0` and `1` value can be used as well.
     * - `"start"` is equivalent to `0`, and will left align the sprite's {@link CellFrameInfo.x | x-position}
     * - `"center"`is equivalent to `0.5`, and will center align the sprite's {@link CellFrameInfo.x | x-position}
     * - `"end"` is equivalent to `1`, and will right align the sprite's {@link CellFrameInfo.x | x-position}
    */
    colAlign?: AlignOption[];
    /** optional row-wise vertical-alignment option for the sprite within each cell's frame.
     * a numeric value between `0` and `1` value can be used as well.
     * - `"start"` is equivalent to `0`, and will top align the sprite's {@link CellFrameInfo.y | y-position}
     * - `"center"`is equivalent to `0.5`, and will center align the sprite's {@link CellFrameInfo.y | y-position}
     * - `"end"` is equivalent to `1`, and will bottom align the sprite's {@link CellFrameInfo.y | y-position}
    */
    rowAlign?: AlignOption[];
    /** optional column-wise column-gap **in-between** the cells */
    colGap?: number[];
    /** optional row-wise row-gap **in-between** the cells */
    rowGap?: number[];
}
/** the grid layout class provides a way for you to compute the locations of sprites had they been organized in a grid. */
export declare class Grid extends SignalingClass implements NonNullable<GridInit>, Hit<[row: number, col: number]> {
    cols: GridInit["cols"];
    rows: GridInit["rows"];
    originAlign: NonNullable<GridInit["originAlign"]>;
    colWidth: NonNullable<GridInit["colWidth"]>;
    rowHeight: NonNullable<GridInit["rowHeight"]>;
    colMinWidth: NonNullable<GridInit["colMinWidth"]>;
    rowMinHeight: NonNullable<GridInit["rowMinHeight"]>;
    colMaxWidth: NonNullable<GridInit["colMaxWidth"]>;
    rowMaxHeight: NonNullable<GridInit["rowMaxHeight"]>;
    colAlign: NonNullable<GridInit["colAlign"]>;
    rowAlign: NonNullable<GridInit["rowAlign"]>;
    colGap: NonNullable<GridInit["colGap"]>;
    rowGap: NonNullable<GridInit["rowGap"]>;
    protected cells: Array2DRowMajor<GridCell>;
    /** get the width of each column in the grid. the widths do not incorporate the length of any column-gaps in-between (invariant to it). */
    getColWidths: Accessor<number[]>;
    /** get the height of each row in the grid. the heights do not incorporate the length of any row-gaps in-between (invariant to it). */
    getRowHeights: Accessor<number[]>;
    /** gives the left position of every column in a left-aligned grid-cell layout.
     * the length of the returned array is `this.cols + 1` (number of columns in grid + 1).
     * the first element is always `0`, because the first column always starts at `left = 0`.
     * the last element highlights the total width of the entire grid (sum of all column max-content-widths + column gaps).
    */
    private get_left_positions;
    /** gives the top position of every row in a top-aligned grid-cell layout.
     * the length of the returned array is `this.rows + 1` (number of rows in grid + 1).
     * the first element is always `0`, because the first row always starts at `top = 0`.
     * the last element highlights the total height of the entire grid (sum of all row max-content-heights + row gaps).
    */
    private get_top_positions;
    /** computes the {@link CellFrameInfo | frameinfo} of each cell within the grid, assuming a top-left grid alignment direction.
     * meaning that the frame information computed here assumes that the first-row-first-column cell is placed at the top-left.
    */
    private get_topleft_aligned_cell_frames;
    /** get the total content-width of this grid.
     * it is simply the summation of all the {@link getColWidths | column-widths}, while also incorporating the in-between column-gap lengths.
    */
    width: Accessor<number>;
    /** get the total content-height of this grid.
     * it is simply the summation of all the {@link getRowHeights | row-heights}, while also incorporating the in-between row-gap lengths.
    */
    height: Accessor<number>;
    /** computes the {@link CellFrameInfo | frameinfo} of each cell within the grid. */
    getCellFrames: Accessor<CellFrameInfo[][]>;
    constructor(config: GridInit, lazy?: boolean);
    getCellFrame(row: number, col: number): CellFrameInfo;
    getRow(row: number): Array2DRowMajor<GridCell>;
    getCol(col: number): any;
    getCell(row: number, col: number): Array2DRowMajor<GridCell>;
    setCell(row: number, col: number, value: GridCell): void;
    /** splice `delete_count` number of rows from the grid, starting with row number `start`. <br>
     * optionally insert `insert_rows_of_cells` in place of deleted rows (beginning from `start` index). <br>
     * the row-major grid of deleted cells is then returned. <br>
     * also, a dirty signal is triggered in the end of the process.
    */
    spliceRows(start: number, delete_count?: number, ...insert_rows_of_cells: Array2DRowMajor<GridCell>): Array2DRowMajor<GridCell>;
    /** splice `delete_count` number of columns from the grid, starting with column number `start`. <br>
     * optionally insert `cols_of_cells` in place of deleted columns (beginning from `start` index). <br>
     * the column-major grid of deleted cells is then returned. <br>
     * also, a dirty signal is triggered in the end of the process.
    */
    spliceCols(start: number, delete_count?: number, ...cols_of_cells: Array2DColMajor<GridCell>): Array2DColMajor<GridCell>;
    rotateRows(amount: number): void;
    rotateCols(amount: number): void;
    /** push in row-major grid of cells to increase row size. also triggers a dirty signal */
    pushRows(...rows_of_cells: Array2DRowMajor<GridCell>): number;
    /** push in column-major grid of cells to increase column size. also triggers a dirty signal */
    pushCols(...cols_of_cells: Array2DColMajor<GridCell>): number;
    /** unshift (left push) in row-major grid of cells to increase row size. also triggers a dirty signal */
    unshiftRows(...rows_of_cells: Array2DRowMajor<GridCell>): number;
    /** unshift (left push) column-major grid of cells to increase column size. also triggers a dirty signal */
    unshiftCols(...cols_of_cells: Array2DColMajor<GridCell>): number;
    /** pop `amount` number of rows from the grid, and return a grid of row-major cells. also triggers a dirty signal */
    popRows(amount?: number): Array2DRowMajor<GridCell>;
    /** pop `amount` number of cols from the grid, and return a grid of column-major cells. also triggers a dirty signal */
    popCols(amount?: number): Array2DColMajor<GridCell>;
    /** shift (left pop) `amount` number of rows from the grid, and return a grid of row-major cells. also triggers a dirty signal */
    shiftRows(amount?: number): Array2DRowMajor<GridCell>;
    /** shift (left pop) `amount` number of cols from the grid, and return a grid of column-major cells. also triggers a dirty signal */
    shiftCols(amount?: number): Array2DColMajor<GridCell>;
    static fromCells(cells: Array2DRowMajor<GridCell>, config?: Omit<GridInit, "rows" | "cols">): Grid;
    /** do a hit test on the grid, relative to its top-left coordinates.
     * the returned value is `[row_number, column_number]` if a cell is successfully hit, otherwise an `undefined` is returned.
     * the hit does **not** check if the sprite within a {@link CellFrameInfo | cell frame} is being hit.
     * it will return a row and column values if a the gap in-between cell sprites is hit.
     * you will have to check whether the sprite's rect is being hit or not by yourself.
    */
    hit(x: number, y: number): [row: number, col: number] | undefined;
    toPreview(ctx: CanvasRenderingContext2D, color?: string): void;
}

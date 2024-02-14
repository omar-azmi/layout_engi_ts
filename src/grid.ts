/** this module provides you with the {@link Grid | `Grid`} class, which lets you compute the positions of cells within a grid layout.
 * 
 * @example
 * ```ts
 * // TODO
 * ```
 * 
 * @module
*/

import { Array2DColMajor, Array2DRowMajor, Array2DShape, clamp, math_max, newArray2D, number_POSITIVE_INFINITY, rotateArray2DMajor, rotateArray2DMinor, spliceArray2DMajor, spliceArray2DMinor } from "./deps.ts"
import { alignmentToNumber, boundboxOfRotatedRect, parseAlignments, zeroCumulativeSum } from "./funcdefs.ts"
import { Accessor, Setter, createMemo, createState } from "./signal.ts"
import { AlignOption, OriginAlignOption } from "./typedefs.ts"


/** an object describing the frame allotted to a {@link GridCell | cell} within a {@link Grid | grid}. <br>
 * the {@link left}, {@link top}, {@link right}, and {@link bottom} properties tell you the 4 edges of the frame reserved specifically to your {@link GridCell | cell},
 * relative to the top-left position of the parent {@link Grid | grid}. <br>
 * the {@link x} and {@link y} properties tell you the sprite's rectangle's unrotated top-left position relative to this cell's frame's top-left position (ie relative to {@link top} and {@link left}). <br>
 * the {@link width} and {@link height} properties tell you the sprite's rectangle's unrotated width and height. <br>
 * the {@link rotation} property tells you how much rotation (in radians) to apply to the center of the sprite.
 * the rotation is about the sprite's center so that it does not alter {@link x} and {@link y} no matter its value. (ie the three properties {@link x}, {@link y}, and {@link rotation} are independent/invariant of each other).
*/
export interface CellFrameInfo {
	/** rectangular frame's left position (x-coordinates) relative to the parent {@link Grid | grid's left-coordinates}. */
	left: number
	/** rectangular frame's top position (y-coordinates) relative to the parent {@link Grid | grid's top-coordinates}. */
	top: number
	/** rectangular frame's right position (x-coordinates) relative to the parent {@link Grid | grid's left-coordinates}. */
	right: number
	/** rectangular frame's bottom position (y-coordinates) relative to the parent {@link Grid | grid's top-coordinates}. */
	bottom: number
	/** spirit's (unrotated) x-position relative to it's cellframe's {@link top}-{@link left} position. */
	x: number
	/** spirit's (unrotated) y-position relative to it's cellframe's {@link top}-{@link left} position. */
	y: number
	/** spirit's width */
	width: number
	/** spirit's height */
	height: number
	/** spirit's rotation relative to its own center. setting a rotation will not alter {@link x} and {@link y}, thanks to the center position's invariance. */
	rotation?: number
}

/** sets the sizing and alignment configuration of a cell within a {@link Grid | `Grid`}. */
export interface GridCell {
	/** declare absolute width of cell. overrides parent {@link Grid | grid's} {@link Grid.rowAlign | `rowAlign`}, just for this child element. */
	width?: number
	/** declare absolute height of cell. overrides parent {@link Grid | grid's} {@link Grid.colAlign | `colAlign`}, just for this child element. */
	height?: number
	/** override parent {@link Grid | grid's} {@link Grid.rowAlign}, just for this child element. */
	rowAlign?: AlignOption
	/** override parent {@link Grid | grid's} {@link Grid.colAlign}, just for this child element. */
	colAlign?: AlignOption
	/** if an anchor is provided, then the point of alignment and justification on this child becomes the anchor, rather than the point set by {@link rowAlign | `rowAlign`} or {@link colAlign | `colAlign`}. */
	anchor?: { x?: number, y?: number }
	/** rotation along the center. */
	rotation?: number
}

/** initial options that customize {@link `Grid`}.
 * these options are also exposed as members of the {@link Grid | grid instance}, and may also be modified by the user.
 * however, you will need to call {@link Grid.setDirty | `setDirty`} method afterwards to have the layout computation rerun.
*/
export interface GridInit {
	/** initial number of columns in the grid. */
	cols: number
	/** initial number of rows in the grid. */
	rows: number
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
	originAlign?: OriginAlignOption
	/** optional column-wise default width of empty cells. */
	colWidth?: number[]
	/** optional row-wise default height of empty cells. */
	rowHeight?: number[]
	/** optional column-wise minimum width of cells. */
	colMinWidth?: number[]
	/** optional row-wise minimum height of cells. */
	rowMinHeight?: number[]
	/** optional column-wise maximum width of cells. */
	colMaxWidth?: number[]
	/** optional row-wise maximum height of cells. */
	rowMaxHeight?: number[]
	/** optional column-wise horizontal-alignment option for the sprite within each cell's frame.
	 * a numeric value between `0` and `1` value can be used as well.
	 * - `"start"` is equivalent to `0`, and will left align the sprite's {@link CellFrameInfo.x | x-position}
	 * - `"center"`is equivalent to `0.5`, and will center align the sprite's {@link CellFrameInfo.x | x-position}
	 * - `"end"` is equivalent to `1`, and will right align the sprite's {@link CellFrameInfo.x | x-position}
	*/
	colAlign?: AlignOption[]
	/** optional row-wise vertical-alignment option for the sprite within each cell's frame.
	 * a numeric value between `0` and `1` value can be used as well.
	 * - `"start"` is equivalent to `0`, and will top align the sprite's {@link CellFrameInfo.y | y-position}
	 * - `"center"`is equivalent to `0.5`, and will center align the sprite's {@link CellFrameInfo.y | y-position}
	 * - `"end"` is equivalent to `1`, and will bottom align the sprite's {@link CellFrameInfo.y | y-position}
	*/
	rowAlign?: AlignOption[]
	/** optional column-wise column-gap **in-between** the cells */
	colGap?: number[]
	/** optional row-wise row-gap **in-between** the cells */
	rowGap?: number[]
}


/** the grid layout class provides a way for you to compute the locations of sprites had they been organized in a grid. */
export class Grid implements NonNullable<GridInit> {
	cols!: GridInit["cols"]
	rows!: GridInit["rows"]
	originAlign!: NonNullable<GridInit["originAlign"]>
	colWidth!: NonNullable<GridInit["colWidth"]>
	rowHeight!: NonNullable<GridInit["rowHeight"]>
	colMinWidth!: NonNullable<GridInit["colMinWidth"]>
	rowMinHeight!: NonNullable<GridInit["rowMinHeight"]>
	colMaxWidth!: NonNullable<GridInit["colMaxWidth"]>
	rowMaxHeight!: NonNullable<GridInit["rowMaxHeight"]>
	colAlign!: NonNullable<GridInit["colAlign"]>
	rowAlign!: NonNullable<GridInit["rowAlign"]>
	colGap!: NonNullable<GridInit["colGap"]>
	rowGap!: NonNullable<GridInit["rowGap"]>
	isDirty!: Accessor<void>
	setDirty!: Setter<void>
	protected cells!: Array2DRowMajor<GridCell>

	private paused = false

	/** manually disable reactivity of {@link isDirty | `isDirty`} accessor, until unpasued by {@link resumeReactivity} */
	pauseReactivity() { this.paused = true }

	/** resume reactivity of {@link isDirty | `isDirty`} accessor, if it had previously been pasued by {@link pauseReactivity} */
	resumeReactivity() { this.paused = false }

	getColWidths: Accessor<number[]> = createMemo<number[]>((id) => {
		this.isDirty(id)
		console.log("recomputing colWidths")
		const
			{ cols, colWidth, colMinWidth, colMaxWidth } = this,
			colWidth_len = colWidth.length,
			colMinWidth_len = colMinWidth.length,
			colMaxWidth_len = colMaxWidth.length,
			max_widths = Array(cols).fill(0)
		for (let c = 0; c < cols; c++) {
			const
				default_width = colWidth[c % colWidth_len],
				min_width = colMinWidth[c % colMinWidth_len],
				max_width = colMaxWidth[c % colMaxWidth_len]
			max_widths[c] = math_max(...this.getCol(c).map((cell) => {
				const
					{ width: sprite_width, height: sprite_height = 0, rotation } = cell,
					width = sprite_width !== undefined ?
						boundboxOfRotatedRect(sprite_width, sprite_height, rotation).width :
						default_width
				return clamp(width, min_width, max_width)
			}))
		}
		return max_widths
	})

	getRowHeights: Accessor<number[]> = createMemo<number[]>((id) => {
		this.isDirty(id)
		console.log("recomputing rowHeights")
		const
			{ rows, rowHeight, rowMinHeight, rowMaxHeight } = this,
			rowHeight_len = rowHeight.length,
			rowMinHeight_len = rowMinHeight.length,
			rowMaxHeight_len = rowMaxHeight.length,
			max_heights = Array(rows).fill(0)
		for (let r = 0; r < rows; r++) {
			const
				default_height = rowHeight[r % rowHeight_len],
				min_height = rowMinHeight[r % rowMinHeight_len],
				max_height = rowMaxHeight[r % rowMaxHeight_len]
			max_heights[r] = math_max(...this.getRow(r).map((cell) => {
				const
					{ width: sprite_width = 0, height: sprite_height, rotation } = cell,
					height = sprite_height !== undefined ?
						boundboxOfRotatedRect(sprite_width, sprite_height, rotation).height :
						default_height
				return clamp(height, min_height, max_height)
			}))
		}
		return max_heights
	})

	getCellFrames: Accessor<CellFrameInfo[][]> = createMemo<CellFrameInfo[][]>((id) => {
		console.log("recomputing cellFrames")
		const
			{
				rows, cols, cells, originAlign, colGap, rowGap,
				colAlign: colAlignGlobal, rowAlign: rowAlignGlobal,
				getColWidths, getRowHeights,
			} = this,
			colGap_len = colGap.length,
			rowGap_len = rowGap.length,
			colAlignGlobal_len = colAlignGlobal.length,
			rowAlignGlobal_len = rowAlignGlobal.length,
			colWidths = getColWidths(id),
			rowHeights = getRowHeights(id),
			left_vals = zeroCumulativeSum(colWidths.map((col_width, c) => col_width + colGap[c % colGap_len])),
			top_vals = zeroCumulativeSum(rowHeights.map((row_height, r) => row_height + rowGap[r % rowGap_len])),
			cell_frames: CellFrameInfo[][] = newArray2D<CellFrameInfo>(rows, cols)
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const
					left = left_vals[c],
					top = top_vals[r],
					thisColWidth = colWidths[c],
					thisRowHeight = rowHeights[r],
					right = left + thisColWidth,
					bottom = top + thisRowHeight,
					{
						width = 0, height = 0, rotation,
						anchor: { x: anchorSelfX, y: anchorSelfY } = {},
						colAlign = colAlignGlobal[c % colAlignGlobal_len],
						rowAlign = rowAlignGlobal[r % rowAlignGlobal_len],
					} = cells[r][c],
					colAlign_val = alignmentToNumber(colAlign),
					rowAlign_val = alignmentToNumber(rowAlign),
					anchorX = anchorSelfX ?? colAlign_val,
					anchorY = anchorSelfY ?? rowAlign_val,
					x = thisColWidth * colAlign_val - width * anchorX,
					y = thisRowHeight * rowAlign_val - height * anchorY
				cell_frames[r][c] = {
					left, top, right, bottom,
					x, y, width, height, rotation,
				}
			}
		}
		// by this point, all `cell_frames`'s positions are based on the `"top-left"` origin alignment.
		// if the origin is deemed to be placed on a different corner, then we'll simply apply the following transformations:
		// - if (origin is on right-corner): (new_cell_frames[r][c].right = grid_total_width - cell_frames[r][c].left) && (new_cell_frames[r][c].left = grid_total_width - cell_frames[r][c].right)
		// - if (origin is on bottom-corner): (new_cell_frames[r][c].bottom = grid_total_height - cell_frames[r][c].top) && (new_cell_frames[r][c].top = grid_total_height - cell_frames[r][c].bottom)
		const
			reverse_horizontal = originAlign.includes("right"),
			reverse_vertical = originAlign.includes("bottom")
		if (reverse_horizontal || reverse_vertical) {
			const
				grid_total_width = (left_vals.at(-1) ?? 0) + (colWidths.at(-1) ?? 0),
				grid_total_height = (top_vals.at(-1) ?? 0) + (rowHeights.at(-1) ?? 0)
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					const
						cell_frame = cell_frames[r][c],
						{ top, left, bottom, right } = cell_frame
					if (reverse_horizontal) {
						cell_frame.right = grid_total_width - left
						cell_frame.left = grid_total_width - right
					}
					if (reverse_vertical) {
						cell_frame.bottom = grid_total_height - top
						cell_frame.top = grid_total_height - bottom
					}
				}
			}
		}
		return cell_frames
	})

	constructor(config: GridInit) {
		const
			{
				rows, cols, originAlign = "",
				colWidth = [0], rowHeight = [0],
				colMinWidth = [0], rowMinHeight = [0],
				colMaxWidth = [number_POSITIVE_INFINITY], rowMaxHeight = [number_POSITIVE_INFINITY],
				colAlign = ["start"], rowAlign = ["start"],
				colGap = [0], rowGap = [0]
			} = config,
			[isDirty, _setDirty] = createState(undefined, { equals: false }),
			setDirty: typeof _setDirty = (new_value) => {
				return this.paused ? false : _setDirty(new_value)
			},
			cells = newArray2D<GridCell>(rows, cols)
		for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { cells[r][c] = {} } }
		Object.assign(this, {
			rows, cols, originAlign, colWidth, rowHeight, colGap, rowGap,
			colMinWidth, rowMinHeight, colMaxWidth, rowMaxHeight,
			colAlign: parseAlignments(colAlign),
			rowAlign: parseAlignments(rowAlign),
			isDirty, setDirty, cells,
		})
		this.getCellFrames() // update the cell frames matrix
	}

	getCellFrame(row: number, col: number): CellFrameInfo {
		const { rows, cols, getCellFrames } = this
		return getCellFrames()[row % rows][col % cols]
	}

	getRow(row: number) { return this.cells[row] }

	getCol(col: number) { return this.cells.map((row) => row[col]) }

	getCell(row: number, col: number) { return this.cells[row][col] }

	setCell(row: number, col: number, value: GridCell) {
		this.cells[row][col] = value
		this.setDirty()
	}

	/** splice `delete_count` number of rows from the grid, starting with row number `start`. <br>
	 * optionally insert `insert_rows_of_cells` in place of deleted rows (beginning from `start` index). <br>
	 * the row-major grid of deleted cells is then returned. <br>
	 * also, a dirty signal is triggered in the end of the process.
	*/
	spliceRows(start: number, delete_count?: number, ...insert_rows_of_cells: Array2DRowMajor<GridCell>): Array2DRowMajor<GridCell> {
		const
			{ cells, setDirty } = this,
			deleted_rows = spliceArray2DMajor(cells, start, delete_count, ...insert_rows_of_cells),
			[new_rows, new_cols] = Array2DShape(cells)
		this.rows = new_rows
		setDirty()
		return deleted_rows
	}

	/** splice `delete_count` number of columns from the grid, starting with column number `start`. <br>
	 * optionally insert `cols_of_cells` in place of deleted columns (beginning from `start` index). <br>
	 * the column-major grid of deleted cells is then returned. <br>
	 * also, a dirty signal is triggered in the end of the process.
	*/
	spliceCols(start: number, delete_count?: number, ...cols_of_cells: Array2DColMajor<GridCell>): Array2DColMajor<GridCell> {
		const
			{ cells, setDirty } = this,
			deleted_cols = spliceArray2DMinor(cells, start, delete_count, ...cols_of_cells),
			[new_rows, new_cols] = Array2DShape(cells)
		this.cols = new_cols
		setDirty()
		return deleted_cols
	}

	rotateRows(amount: number): void {
		const { cells, setDirty } = this
		rotateArray2DMajor(cells, amount)
		setDirty()
		return
	}

	rotateCols(amount: number): void {
		const { cells, setDirty } = this
		rotateArray2DMinor(cells, amount)
		setDirty()
		return
	}

	/** push in row-major grid of cells to increase row size. also triggers a dirty signal */
	pushRows(...rows_of_cells: Array2DRowMajor<GridCell>): number {
		const
			{ rows, cols } = this,
			[rows_added, cols_added] = Array2DShape(rows_of_cells),
			total_rows = rows + rows_added
		if (cols_added !== cols) {
			console.error(`number of columns mismatched. cannot push new rows with ${cols_added} columns onto existing grid with ${cols} columns`)
			return rows
		}
		this.spliceRows(rows, 0, ...rows_of_cells)
		console.assert(this.rows === total_rows)
		return total_rows
	}

	/** push in column-major grid of cells to increase column size. also triggers a dirty signal */
	pushCols(...cols_of_cells: Array2DColMajor<GridCell>): number {
		const
			{ rows, cols } = this,
			[cols_added, rows_added] = Array2DShape(cols_of_cells),
			total_cols = cols + cols_added
		if (rows_added !== rows) {
			console.error(`number of rows mismatched. cannot push new cols with ${rows_added} rows onto existing grid with ${rows} rows`)
			return cols
		}
		this.spliceCols(cols, 0, ...cols_of_cells)
		console.assert(this.cols === total_cols)
		return total_cols
	}

	/** unshift (left push) in row-major grid of cells to increase row size. also triggers a dirty signal */
	unshiftRows(...rows_of_cells: Array2DRowMajor<GridCell>): number {
		const
			{ rows, cols } = this,
			[rows_added, cols_added] = Array2DShape(rows_of_cells),
			total_rows = rows + rows_added
		if (cols_added !== cols) {
			console.error(`number of columns mismatched. cannot unshift new rows with ${cols_added} columns onto existing grid with ${cols} columns`)
			return rows
		}
		this.spliceRows(0, 0, ...rows_of_cells)
		console.assert(this.rows === total_rows)
		return total_rows
	}

	/** unshift (left push) column-major grid of cells to increase column size. also triggers a dirty signal */
	unshiftCols(...cols_of_cells: Array2DColMajor<GridCell>): number {
		const
			{ rows, cols } = this,
			[cols_added, rows_added] = Array2DShape(cols_of_cells),
			total_cols = cols + cols_added
		if (rows_added !== rows) {
			console.error(`number of rows mismatched. cannot unshift new cols with ${rows_added} rows onto existing grid with ${rows} rows`)
			return cols
		}
		this.spliceCols(0, 0, ...cols_of_cells)
		console.assert(this.cols === total_cols)
		return total_cols
	}

	/** pop `amount` number of rows from the grid, and return a grid of row-major cells. also triggers a dirty signal */
	popRows(amount: number = 1): Array2DRowMajor<GridCell> {
		return this.spliceRows(this.rows - amount, amount)
	}

	/** pop `amount` number of cols from the grid, and return a grid of column-major cells. also triggers a dirty signal */
	popCols(amount: number = 1): Array2DColMajor<GridCell> {
		return this.spliceCols(this.cols - amount, amount)
	}

	/** shift (left pop) `amount` number of rows from the grid, and return a grid of row-major cells. also triggers a dirty signal */
	shiftRows(amount: number = 1): Array2DRowMajor<GridCell> {
		return this.spliceRows(0, amount)
	}

	/** shift (left pop) `amount` number of cols from the grid, and return a grid of column-major cells. also triggers a dirty signal */
	shiftCols(amount: number = 1): Array2DColMajor<GridCell> {
		return this.spliceCols(0, amount)
	}

	static fromCells(cells: Array2DRowMajor<GridCell>, config?: Omit<GridInit, "rows" | "cols">): Grid {
		const
			[rows, cols] = Array2DShape(cells),
			grid = new this({ rows: 0, cols, ...config })
		grid.pushRows(...cells)
		return grid
	}

	// TODO: implement this. see its {@link FrameSplit.hit} analog
	hit(x: number, y: number): [row: number, col: number] | undefined { return }

	// TODO: implement this debug-only method, with an implementation similar to {@link FrameSplit.toPreview}
	toPreview(ctx: CanvasRenderingContext2D, color?: string) { }
}

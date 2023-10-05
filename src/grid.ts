import { Accessor, createMemo, createSignal, createEffect, batch, untrack, pauseEffect, resumeEffect, Setter, resumeReactivity, pauseReactivity } from "./deps.ts"
import { Array2DShape, spliceArray2DMajor, spliceArray2DMinor, rotateArray2DMajor, rotateArray2DMinor, Array2D, Array2DRowMajor, Array2DColMajor } from "./deps.ts"
import { max, min, sum, cumulativeSum } from "./deps.ts"
import { math_max, math_min, math_abs, math_sin, math_cos } from "https://deno.land/x/kitchensink_ts@v0.7.0/builtin_aliases.ts"

/** a number between 0 and 1 (inclusive) */
type UnitNumber = number
type AlignOption = UnitNumber | "start" | "center" | "end"

/** an object describing the frame allotted to a cell ({@link GridCell}) within a grid ({@link Grid}) <br>
 * the {@link left}, {@link top}, {@link right}, and {@link bottom} properties tell you the 4 edges of the frame reserved specifically to your {@link GridCell},
 * relative to the top-left position of the parent {@link Grid} <br>
 * the {@link x} and {@link y} properties tell you the sprite's rectangle's unrotated top-left position relative to this cell's frame's top-left position (ie relative to {@link top} and {@link left}) <br>
 * the {@link width} and {@link height} properties tell you the sprite's rectangle's unrotated width and height <br>
 * the {@link rotation} property tells you how much rotation (in radians) to apply to the center of the sprite.
 * the rotation is about the sprite's center so that it does not alter {@link x} and {@link y} no matter its value. (ie the three properties {@link x}, {@link y}, and {@link rotation} are independant of each other or invariants)
*/
interface CellFrameInfo {
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

const
	alignment_to_number = (alignment: AlignOption, reverse: boolean = false): UnitNumber => {
		if (typeof alignment === "string") {
			alignment = alignment === "start" ? 0 : alignment === "end" ? 1 : 0.5
		}
		return reverse ? 1 - alignment : alignment
	},
	parse_alignments = (alignments: AlignOption | AlignOption[], reverse: boolean = false): UnitNumber[] => {
		alignments = Array.isArray(alignments) ? alignments : [alignments]
		return alignments.map((v) => alignment_to_number(v, reverse))
	},
	zeroCumulativeSum = (arr: number[]): number[] => {
		const cum_sum = cumulativeSum(arr)
		cum_sum.pop()
		return cum_sum
	},
	/** get the bounding box width and height of a rectangle that has been rotated at its center */
	get_rotated_bound_box = (width: number, height: number, rotation?: number): { width: number, height: number } => {
		if (!rotation) { return { width, height } }
		const
			abs_cos_rot = math_abs(math_cos(rotation)),
			abs_sin_rot = math_abs(math_sin(rotation))
		return {
			width: width * abs_cos_rot + height * abs_sin_rot,
			height: width * abs_sin_rot + height * abs_cos_rot
		}
	}


interface GridCell {
	/** width of cell. overides parent {@link Grid}'s {@link Grid.rowAlign}, just for this child element */
	width?: number
	/** height of cell. overides parent {@link Grid}'s {@link Grid.colAlign}, just for this child element */
	height?: number
	/** overide parent {@link Grid}'s {@link Grid.rowAlign}, just for this child element */
	rowAlign?: AlignOption
	/** overide parent {@link Grid}'s {@link Grid.colAlign}, just for this child element */
	colAlign?: AlignOption
	/** if an anchor is provided, then the point of alignment and justification on this child becomes the anchor, rather than the point set by {@link rowAlign} or {@link colAlign} */
	anchor?: { x?: number, y?: number }
	/** rotation along the center */
	rotation?: number
}

interface GridInit {
	cols: number
	rows: number
	colWidth?: number[]
	rowHeight?: number[]
	colAlign?: AlignOption[]
	rowAlign?: AlignOption[]
	colGap?: number[]
	rowGap?: number[]
}

class Grid implements NonNullable<GridInit> {
	cols!: GridInit["cols"]
	rows!: GridInit["rows"]
	colWidth!: NonNullable<GridInit["colWidth"]>
	rowHeight!: NonNullable<GridInit["rowHeight"]>
	colAlign!: NonNullable<GridInit["colAlign"]>
	rowAlign!: NonNullable<GridInit["rowAlign"]>
	colGap!: NonNullable<GridInit["colGap"]>
	rowGap!: NonNullable<GridInit["rowGap"]>
	isDirty!: Accessor<undefined>
	setDirty!: Setter<undefined>
	cells!: Array2DRowMajor<GridCell>

	private getColWidths: Accessor<number[]>
	private getRowHeights: Accessor<number[]>
	public getCellFrames: Accessor<CellFrameInfo[][]>

	constructor(config: GridInit) {
		const
			{
				rows, cols,
				colWidth = [0], rowHeight = [0],
				colAlign = ["start"], rowAlign = ["start"],
				colGap = [0], rowGap = [0]
			} = config,
			[isDirty, setDirty] = createSignal(undefined, { equals: false }),
			cells = Array(rows).fill(undefined).map(() => Array(cols).fill(undefined))
		for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { cells[r][c] = {} } }
		Object.assign(this, {
			rows, cols, colWidth, rowHeight, colGap, rowGap,
			colAlign: parse_alignments(colAlign),
			rowAlign: parse_alignments(rowAlign),
			isDirty, setDirty, cells,
		})

		this.getColWidths = createMemo<number[]>(() => {
			this.isDirty()
			console.log("recomputing colWidths")
			const
				{ cols, colWidth } = this,
				colWidth_len = colWidth.length,
				max_widths = Array(cols).fill(0)
			for (let c = 0; c < cols; c++) {
				const default_width = colWidth[c % colWidth_len]
				max_widths[c] = math_max(...this.getCol(c).map((cell) => {
					const { width, height = 0, rotation } = cell
					return width !== undefined ?
						get_rotated_bound_box(width, height, rotation).width :
						default_width
				}))
			}
			return max_widths
		})

		this.getRowHeights = createMemo<number[]>(() => {
			this.isDirty()
			console.log("recomputing rowHeights")
			const
				{ rows, rowHeight } = this,
				rowHeight_len = rowHeight.length,
				max_heights = Array(rows).fill(0)
			for (let r = 0; r < rows; r++) {
				const default_height = rowHeight[r % rowHeight_len]
				max_heights[r] = math_max(...this.getRow(r).map((cell) => {
					const { width = 0, height, rotation } = cell
					return height !== undefined ?
						get_rotated_bound_box(width, height, rotation).height :
						default_height
				}))
			}
			return max_heights
		})

		this.getCellFrames = createMemo<CellFrameInfo[][]>(() => {
			console.log("recomputing cellFrames")
			const
				{ rows, cols, cells, colGap, rowGap, colAlign: colAlignGlobal, rowAlign: rowAlignGlobal, getColWidths, getRowHeights } = this,
				colGap_len = colGap.length,
				rowGap_len = rowGap.length,
				colAlignGlobal_len = colAlignGlobal.length,
				rowAlignGlobal_len = rowAlignGlobal.length,
				colWidths = getColWidths(),
				rowHeights = getRowHeights(),
				left_vals = zeroCumulativeSum(colWidths.map((col_width, c) => col_width + colGap[c % colGap_len])),
				top_vals = zeroCumulativeSum(rowHeights.map((row_height, r) => row_height + rowGap[r % rowGap_len])),
				cell_frames: CellFrameInfo[][] = Array(rows).fill(undefined).map(() => Array(cols).fill(undefined))
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
						colAlign_val = alignment_to_number(colAlign),
						rowAlign_val = alignment_to_number(rowAlign),
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
			return cell_frames
		})

		// no need to setDirty, as the signal is dirty by default (during the initial computation)
		//this.setDirty()
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
	 * optionally insert `insert_rows_of_cells` in place of deleted rows (begining from `start` index). <br>
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
	 * optionally insert `cols_of_cells` in place of deleted columns (begining from `start` index). <br>
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
		//pauseReactivity()
		grid.pushRows(...cells)
		//resumeReactivity()
		//grid.setDirty()
		return grid
	}
}



// run example
const grid = Grid.fromCells([
	[{ width: 10, height: 10 }, { width: 5, height: 20 }, { width: 50, height: 2 }],
	[{ width: 9, height: 14 }, { width: 15, height: 40 }, { width: 52, height: 20 }],
	[{ width: 18, height: 77 }, { width: 95, height: 10 }, { width: 12, height: 44 }],
	[{ width: 1, height: 92 }, { width: 5, height: 14 }, { width: 10, height: 41 }],
], { colAlign: ["end"], rowAlign: ["center"] })

grid.getCellFrames()

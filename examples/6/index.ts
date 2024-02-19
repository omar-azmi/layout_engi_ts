import { Array2DRowMajor, dom_clearInterval, dom_setInterval, math_random, newArray2D, promiseTimeout, shuffleArray } from "../../src/deps.ts"
import { Grid } from "../../src/grid.ts"
import { createLazy, signalCtx } from "../../src/signal.ts"

const app_config = {
	loading: 1000,
	lazy_load_interval: 300,
	image_dir: "../assets/grid_images/",
	max_cols: 7,
	col_offset: 0,
	max_images: 100,
}


class Grid2 extends Grid {
	pushCol(amount = 1) {
		this.pauseReactivity()
		const
			max_cols = app_config.max_cols,
			left_col_idx = app_config.col_offset,
			right_col_idx = left_col_idx + this.cols,
			new_right_col_idx = Math.min(app_config.max_images, right_col_idx + amount),
			new_left_col_idx = Math.max(0, left_col_idx, new_right_col_idx - max_cols),
			cols_to_shift = new_left_col_idx - left_col_idx
		if (cols_to_shift > 0) {
			super.shiftCols(cols_to_shift)
			app_config.col_offset = new_left_col_idx
		}
		const cols_to_push = newArray2D(Math.min(max_cols, amount), rows, () => ({}))
		super.pushCols(...cols_to_push)
		this.resumeReactivity()
		loadRangeOfImages(app_config.loading, [Math.max(new_left_col_idx, right_col_idx), new_right_col_idx])
	}

	unshiftCol(amount = 1) {
		this.pauseReactivity()
		const
			max_cols = app_config.max_cols,
			left_col_idx = app_config.col_offset,
			right_col_idx = left_col_idx + this.cols,
			new_left_col_idx = Math.max(0, left_col_idx - amount),
			new_right_col_idx = Math.min(right_col_idx, new_left_col_idx + max_cols),
			cols_to_pop = right_col_idx - new_right_col_idx
		if (cols_to_pop > 0) {
			super.popCols(cols_to_pop)
		}
		app_config.col_offset = new_left_col_idx
		const cols_to_unshift = newArray2D(Math.min(max_cols, amount), rows, () => ({}))
		super.unshiftCols(...cols_to_unshift)
		this.resumeReactivity()
		loadRangeOfImages(app_config.loading, [new_left_col_idx, Math.min(new_right_col_idx, left_col_idx)])
	}

	popCol(amount = 1) {
		const
			left_col_idx = app_config.col_offset,
			right_col_idx = left_col_idx + this.cols,
			new_right_col_idx = Math.max(0, right_col_idx - amount),
			new_left_col_idx = Math.min(left_col_idx, new_right_col_idx)
		app_config.col_offset = new_left_col_idx
		super.popCols(amount)
	}

	shiftCol(amount = 1) {
		const
			left_col_idx = app_config.col_offset,
			new_left_col_idx = Math.max(0, left_col_idx + amount)
		app_config.col_offset = new_left_col_idx
		super.shiftCols(amount)
	}
}

const
	rows = 8, cols = 3,
	grid = new Grid2({ rows: rows, cols: cols, originAlign: "right", colAlign: ["end"], rowAlign: ["center"], colGap: [30], rowGap: [30] }, true),
	scale = [0.1, 0.1, 0.25, 1.5 / 4, 0.25, 1.5 / 4, 1.75 / 4, 1.25 / 4]

let image_matrix: Array2DRowMajor<HTMLImageElement>

const loadImage = async (row: number, col: number): Promise<void> => {
	const
		img = new Image(),
		col_id = col % 10
	image_matrix[row][col] = img
	img.onload = () => { plotImage(row, col, img) }
	img.src = app_config.image_dir + `${row},${col_id}.jpg`
}

const loadRangeOfImages = async (simulate_loading_time = 0, col_range: [number, number] | undefined = undefined) => {
	col_range ??= [app_config.col_offset, app_config.col_offset + grid.cols]
	const
		row_col_permutations: [row: number, col: number][] = [],
		promises: Promise<void>[] = [],
		[col_start, col_end] = col_range
	for (let col = col_start; col < col_end; col++) {
		for (let row = 0; row < rows; row++) {
			row_col_permutations.push([row, col])
		}
	}
	// simulating random loading, rather than sequential, since our server is locally hosted, everything loads pretty much sequentially in the requested order
	shuffleArray(row_col_permutations)
	for (const [row, col] of row_col_permutations) {
		promises.push(promiseTimeout(math_random() * (simulate_loading_time)).then(() => loadImage(row, col)))
	}
	Promise.all(promises)
}

const loadAllImages = async (simulate_loading_time = 0) => {
	image_matrix = newArray2D<HTMLImageElement>(rows, app_config.max_images)
	return loadRangeOfImages(simulate_loading_time, undefined)
}

const plotImage = (row: number, col: number, img: HTMLImageElement) => {
	const { width, height } = img
	grid.setCell(row, Math.max(0, (col - app_config.col_offset) % grid.cols), { width: width * scale[row], height: height * scale[row] })
}

const
	canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d")!
canvas.width = 2000
canvas.height = 800

const redraw = createLazy((id) => {
	const cell_frames = grid.getCellFrames(id)
	ctx.reset()
	console.log("redraw")
	for (let col = 0; col < grid.cols; col++) {
		for (let row = 0; row < grid.rows; row++) {
			const
				{ left, top, x, y, width, height } = cell_frames[row][col],
				img = image_matrix[row][col + app_config.col_offset]
			if (img) {
				ctx.drawImage(img, left + x, top + y, width, height)
			}
		}
	}
})

canvas.onmousedown = (event: MouseEvent) => {
	const { offsetX, offsetY, currentTarget: elem } = event
	const hit_cell_idx = grid.hit(offsetX, offsetY)
	if (hit_cell_idx) {
		const
			{ left, top, x: relative_x, y: relative_y, width, height } = grid.getCellFrame(...hit_cell_idx),
			x = left + relative_x,
			y = top + relative_y,
			clickXPos_within_bounds = offsetX >= x && offsetX <= x + width,
			clickYPos_within_bounds = offsetY >= y && offsetY <= y + height
		if (clickXPos_within_bounds && clickYPos_within_bounds) {
			const original_style = ctx.strokeStyle
			ctx.strokeStyle = "red"
			ctx.strokeRect(x, y, width, height)
			ctx.strokeStyle = original_style
		}
	}
}
document.body.appendChild(canvas)

loadAllImages(app_config.loading).then(() => {
	redraw()
})

let prev_redraw_interval: number | undefined = undefined
const set_redraw_interval = () => {
	dom_clearInterval(prev_redraw_interval)
	dom_setInterval(redraw, app_config.lazy_load_interval)
}
set_redraw_interval()

export {
	app_config, grid, loadAllImages, redraw, set_redraw_interval, signalCtx
}


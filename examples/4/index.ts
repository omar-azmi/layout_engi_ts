import { EqualityCheck, EqualityFn, THROTTLE_REJECT, default_equality, dom_clearTimeout, dom_setTimeout, falsey_equality, math_random, newArray2D, noop, promiseTimeout, shuffleArray, throttle } from "../../src/deps.ts"
import { Grid } from "../../src/grid.ts"
import { createMemoSignal, signalCtx } from "../../src/signal.ts"

const app_config = {
	loading: 3000,
	throttle: 200,
	trail: 500,
	image_dir: "../assets/grid_images/",
}

const throttleAndTrailingEquals = <T>(trailing_time_ms: number, delta_time_ms: number, base_equals?: EqualityCheck<T>, trailing_callback: () => void = noop): EqualityFn<T> => {
	const
		base_equals_fn = base_equals === false ? falsey_equality : (base_equals ?? default_equality),
		throttled_equals = throttle(delta_time_ms, base_equals_fn)
	let prev_timeout_id: number | undefined = undefined
	return (prev_value: T | undefined, new_value: T) => {
		// disable any ongoing countdown for a previous trailing action
		dom_clearTimeout(prev_timeout_id)
		const is_equal = throttled_equals(prev_value, new_value)
		if (is_equal === THROTTLE_REJECT) {
			// enable a count down for trailing action
			prev_timeout_id = dom_setTimeout(trailing_callback, trailing_time_ms)
			return true
		}
		return is_equal
	}
}


const
	rows = 8, cols = 10,
	grid = new Grid({ rows: rows, cols: cols, originAlign: "right", colAlign: ["end"], rowAlign: ["center"], colGap: [30], rowGap: [30] }),
	scale = [0.1, 0.1, 0.25, 1.5 / 4, 0.25, 1.5 / 4, 1.75 / 4, 1.25 / 4]

let image_matrix: HTMLImageElement[][]

const loadImage = async (row: number, col: number): Promise<void> => {
	const img = new Image()
	image_matrix[row][col] = img
	img.onload = () => { plotImage(row, col) }
	img.src = app_config.image_dir + `${row},${col}.jpg`
}

const loadAllImages = async (simulate_loading_time = 0) => {
	image_matrix = newArray2D<HTMLImageElement>(rows, cols)
	const
		row_col_permutations: [row: number, col: number][] = [],
		promises: Promise<void>[] = []
	for (let col = 0; col < cols; col++) {
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

const plotImage = (row: number, col: number) => {
	const { width, height } = image_matrix[row][col]
	grid.setCell(row, col, { width: width * scale[row], height: height * scale[row] })
}

const
	canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d")!
canvas.width = 2000
canvas.height = 800

const [id_throttledGetCellFrames, throttledGetCellFrames] = createMemoSignal((id) => {
	return grid.getCellFrames(id)
}, {
	equals: throttleAndTrailingEquals(app_config.trail, app_config.throttle, false, () => signalCtx.runId(id_throttledRedraw))
})
const updateThrottleGetCellFrames_equals = (trailing_time_ms: number, delta_time_ms: number) => {
	signalCtx.dynamic.setEquals(
		id_throttledGetCellFrames,
		throttleAndTrailingEquals(
			trailing_time_ms,
			delta_time_ms,
			false,
			() => signalCtx.runId(id_throttledRedraw),
		)
	)
}

const redraw = () => {
	const cell_frames = grid.getCellFrames()
	ctx.reset()
	console.log("redraw")
	for (let col = 0; col < grid.cols; col++) {
		for (let row = 0; row < grid.rows; row++) {
			const
				{ left, top, x, y, width, height } = cell_frames[row][col],
				img = image_matrix[row][col]
			if (img) {
				ctx.drawImage(img, left + x, top + y, width, height)
			}
		}
	}
}

const [id_throttledRedraw, throttledRedraw] = createMemoSignal((id) => {
	const cell_frames = throttledGetCellFrames(id)
	ctx.reset()
	console.log("throttled-redraw")
	for (let col = 0; col < grid.cols; col++) {
		for (let row = 0; row < grid.rows; row++) {
			const
				{ left, top, x, y, width, height } = cell_frames[row][col],
				img = image_matrix[row][col]
			if (img) {
				ctx.drawImage(img, left + x, top + y, width, height)
			}
		}
	}
}, { equals: false })

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
	throttledRedraw()
})

export {
	app_config, grid, loadAllImages, redraw,
	signalCtx, updateThrottleGetCellFrames_equals
}

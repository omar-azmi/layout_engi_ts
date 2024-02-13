import { EqualityCheck, EqualityFn, THROTTLE_REJECT, default_equality, dom_clearTimeout, dom_setTimeout, falsey_equality, math_random, newArray2D, noop, promiseTimeout, shuffleArray, throttle } from "../src/deps.ts"
import { Grid } from "../src/grid.ts"
import { _createMemo, createMemo, signal_ctx } from "../src/signal.ts"

const app_config = {
	loading: 3000,
	throttle: 200,
	trail: 500,
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
	rows = 8,
	cols = 10,
	grid = new Grid({ rows: rows, cols: cols, originAlign: "right", colAlign: ["end"], rowAlign: ["center"], colGap: [30], rowGap: [30] }),
	scale = [0.1, 0.1, 0.25, 1.5 / 4, 0.25, 1.5 / 4, 1.75 / 4, 1.25 / 4]

let image_matrix: HTMLImageElement[][]

const loadImage = async (row: number, col: number): Promise<void> => {
	const img = new Image()
	image_matrix[row][col] = img
	img.onload = () => { plotImage(row, col) }
	img.src = `./grid.test_1.data/${row},${col}.jpg`
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

globalThis.onload = () => {
	const
		canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d")!
	canvas.width = 2000
	canvas.height = 800

	const [id_throttledGetCellFrames, throttledGetCellFrames] = _createMemo((id) => {
		return grid.getCellFrames(id)
	}, {
		equals: throttleAndTrailingEquals(app_config.trail, app_config.throttle, false, () => signal_ctx.runId(id_redraw))
	})
	const updateThrottleGetCellFrames_equals = (trailing_time_ms: number, delta_time_ms: number) => {
		signal_ctx.dynamic.setEquals(
			id_throttledGetCellFrames,
			throttleAndTrailingEquals(
				trailing_time_ms,
				delta_time_ms,
				false,
				() => signal_ctx.runId(id_redraw),
			)
		)
	}

	const [id_redraw, redraw] = _createMemo((id) => {
		console.log("redraw")
		ctx.clearRect(0, 0, 2000, 800)
		const cell_frames = throttledGetCellFrames(id)
		for (let col = 0; col < cols; col++) {
			for (let row = 0; row < rows; row++) {
				const
					{ left, top, x, y, width, height } = cell_frames[row][col],
					img = image_matrix[row][col]
				if (img) {
					ctx.drawImage(img, left + x, top + y, width, height)
				}
			}
		}
	})



	document.body.appendChild(document.createElement("div")).textContent = "simulate loading time, redraw throttle time, redraw trailing time"
	document.body.appendChild(document.createElement("input")).oninput = ((event) => {
		const elem = event.target as HTMLInputElement
		const loading_time = parseFloat(elem.value)
		app_config.loading = isFinite(loading_time) ? loading_time : 0
	})
	document.body.appendChild(document.createElement("input")).oninput = ((event) => {
		const elem = event.target as HTMLInputElement
		const throttle_time = parseFloat(elem.value)
		app_config.throttle = isFinite(throttle_time) ? throttle_time : 0
	})
	document.body.appendChild(document.createElement("input")).oninput = ((event) => {
		const elem = event.target as HTMLInputElement
		const trailing_time = parseFloat(elem.value)
		app_config.trail = isFinite(trailing_time) ? trailing_time : 0
	})
	const reload_button = document.body.appendChild(document.createElement("button"))
	reload_button.onclick = ((event) => {
		updateThrottleGetCellFrames_equals(app_config.trail, app_config.throttle)
		loadAllImages(app_config.loading)
		for (let row = 0; row < grid.rows; row++) {
			for (let col = 0; col < grid.cols; col++) {
				grid.setCell(row, col, {})
			}
		}
	})
	reload_button.textContent = "reload all images"

	document.body.appendChild(canvas)


	loadAllImages(app_config.loading).then(() => {
		redraw()
	})
}

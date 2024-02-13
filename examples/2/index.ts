import { Setter, debounce, object_entries } from "../../src/deps.ts"
import { AnyLength, FrameSplit as FrameSplitBase, LengthUnit, MarginValue, parseLengthUnit, pick_color_iter, stringifyLengthUnit } from "../../src/framesplit.ts"

class FrameController {
	HTMLElement: HTMLTableElement = document.createElement("table")
	tbody = this.HTMLElement.createTBody()
	constructor() { }

	bindTo(frame: FrameSplitBase) {
		const frame_set_entries = object_entries(frame.set)
			.filter(([key, setter]) => setter !== undefined) // remove non-settable options
			.sort(([key_a,], [key_b]) => +(key_a > key_b) * 2 - 1) as [keyof typeof frame["set"], Setter<number | LengthUnit | MarginValue>][] // sort the entries according to their alphabetical order
		const tbody = this.tbody
		tbody.replaceChildren() // destroy all old rows (children)
		for (const [key, setter] of frame_set_entries) {
			const
				initial_value = frame[key]!(),
				input = document.createElement("input"),
				trow = tbody.insertRow()
			trow.insertCell().textContent = key
			trow.insertCell().appendChild(input)
			switch (key) {
				case "left": case "right": case "top": case "bottom": {
					input.value = String(initial_value as number)
					input.oninput = () => setter(Number(input.value))
					break
				}
				case "height": case "width": {
					input.value = stringifyLengthUnit(initial_value as LengthUnit)
					input.oninput = () => setter(parseLengthUnit(input.value as AnyLength))
					break
				}
				case "margin": {
					input.value = JSON.stringify(initial_value as MarginValue)
					input.oninput = () => {
						try { setter(JSON.parse(input.value)) }
						catch (error) { }
					}
					break
				}
			}
		}
	}
}

class FrameSplit extends FrameSplitBase {
	private static selected_instance: FrameSplitBase | undefined = undefined
	static selectFrame(instance?: FrameSplitBase) {
		this.selected_instance = instance
	}
	toPreview(ctx: CanvasRenderingContext2D, color?: string) {
		super.toPreview(ctx, FrameSplit.selected_instance === this ? "red" : color)
	}
}

// run
const
	layout = new FrameSplit(0, 100, 700, 700),
	lpane = layout.splitChildLeft({ px: 100, vw: 0.5 }),
	rpane = layout.splitChildRight({ vw: 0.25 }),
	center = layout.splitChildBottom("300px + 0.25vh", { bottom: 50 })
rpane.splitChildTop({ px: -200 / 2, vh: 0.5 })
rpane.splitChildTop(200)

const
	controller = new FrameController(),
	canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d") as CanvasRenderingContext2D,
	select_layout_frame = debounce(50, (evt: PointerEvent): void => {
		const hit_frame = layout.hit(evt.offsetX, evt.offsetY)
		FrameSplit.selectFrame(hit_frame)
		if (hit_frame) { controller.bindTo(hit_frame) }
	})

canvas.setAttribute("style", "background-color: black;")
canvas.width = 800
canvas.height = 800
canvas.onpointerdown = select_layout_frame
document.body.appendChild(controller.HTMLElement)
document.body.appendChild(canvas)
const animate = () => {
	ctx.clearRect(0, 0, 10000, 10000)
	layout.toPreview(ctx)
}
const animate_interval_id = setInterval(requestAnimationFrame, 1000 / 15, animate)

const dynamic = false
let w_fn_interval, h_fn_interval, panx_fn_interval
if (dynamic) {
	setTimeout(() => {
		let w = 0, w_sign = 1, h = 0, h_sign = 1
		const w_fn = () => {
			w += 14 / 3 * w_sign
			if (w < 0) { w_sign = 1 }
			else if (w > 400) { w_sign = -1 }
			lpane.set.width!({ px: w, vw: 0.1, vh: 0 })
		}
		const h_fn = () => {
			h += 10 / 3 * h_sign
			if (h < 0) { h_sign = 1 }
			else if (h > 600) { h_sign = -1 }
			center.set.height!({ px: h, vh: 0.1 })
		}
		const panx_fn = () => {
			layout.set.left!((prev = 0) => (prev + 1))
			layout.set.right!((prev = 0) => (prev + 1))
		}
		w_fn_interval = setInterval(requestAnimationFrame, 6, w_fn)
		h_fn_interval = setInterval(requestAnimationFrame, 10, h_fn)
		panx_fn_interval = setInterval(requestAnimationFrame, 50, panx_fn)
	}, 1000)
}

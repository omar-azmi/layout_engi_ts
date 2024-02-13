import { Accessor, Setter, debounce } from "../../src/deps.ts"
import { AnyLength, FrameSplit as FrameSplitBase, LengthUnit, parseLengthUnit, stringifyLengthUnit } from "../../src/framesplit.ts"

const add_controller = (
	signal_getter: Accessor<LengthUnit>,
	signal_setter: Setter<LengthUnit>,
) => {
	const controller = document.createElement("input")
	controller.value = stringifyLengthUnit(signal_getter())
	controller.addEventListener("input", () => {
		signal_setter(parseLengthUnit(controller.value as AnyLength))
	})
	document.body.appendChild(controller)
}

class FrameSplit extends FrameSplitBase {
	private static selected_instance: FrameSplitBase | undefined = undefined
	static selectFrame(instance?: FrameSplitBase) {
		this.selected_instance = instance
	}

	splitChildLeft(...args) {
		const new_child = super.splitChildLeft(...args)
		add_controller(new_child.width, new_child.set.width)
		return new_child
	}
	splitChildTop(...args) {
		const new_child = super.splitChildTop(...args)
		add_controller(new_child.height, new_child.set.height)
		return new_child
	}
	splitChildRight(...args) {
		const new_child = super.splitChildRight(...args)
		add_controller(new_child.width, new_child.set.width)
		return new_child
	}
	splitChildBottom(...args) {
		const new_child = super.splitChildBottom(...args)
		add_controller(new_child.height, new_child.set.height)
		return new_child
	}
	toPreview(ctx: CanvasRenderingContext2D, color?: string) {
		super.toPreview(ctx, FrameSplit.selected_instance === this ? "red" : color)
	}
}

// run
const
	layout = new FrameSplit(0, 100, 700, 700),
	lpane = layout.splitChildLeft({ px: 100, vw: 0.5 }),
	rpane = layout.splitChildRight({ vw: 0.25 }).splitChildTop("200px", { top: 100 }),
	center = layout.splitChildBottom("300px + 0.25vh", { bottom: 50 })

const
	canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d") as CanvasRenderingContext2D,
	select_layout_frame = debounce(150, (evt: PointerEvent): void => {
		const hit_frame = layout.hit(evt.offsetX, evt.offsetY)
		FrameSplit.selectFrame(hit_frame)
		if (hit_frame) {
			console.log(hit_frame.set)
		}
	})

canvas.setAttribute("style", "background-color: black;")
canvas.width = 800
canvas.height = 800
document.body.appendChild(canvas)
canvas.onpointermove = select_layout_frame
const animate = () => {
	ctx.clearRect(0, 0, 10000, 10000)
	layout.toPreview(ctx)
}
const animate_interval_id = setInterval(requestAnimationFrame, 1000 / 15, animate)

const dynamic = true
let w_fn_interval, h_fn_interval
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
		w_fn_interval = setInterval(requestAnimationFrame, 6, w_fn)
		h_fn_interval = setInterval(requestAnimationFrame, 10, h_fn)
	}, 1000)
}

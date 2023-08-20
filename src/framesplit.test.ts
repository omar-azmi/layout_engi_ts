import { Accessor, Setter } from "./deps.ts"
import { FrameSplit as FrameSplitBase, LengthUnit, LengthUnitLiteral, parseLengthUnit, stringifyLengthUnit } from "./framesplit.ts"

const add_controller = (
	signal_getter: Accessor<LengthUnit>,
	signal_setter: Setter<LengthUnit>,
) => {
	const controller = document.createElement("input")
	controller.value = stringifyLengthUnit(signal_getter())
	controller.addEventListener("input", () => {
		signal_setter(parseLengthUnit(controller.value as LengthUnitLiteral))
	})
	document.body.appendChild(controller)
}

class FrameSplit extends FrameSplitBase {
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
}

// run
const layout = new FrameSplit(0, 100, 700, 700)
layout.splitChildLeft({ px: 100, vw: 0.5 })
layout.splitChildRight({ vw: 0.25 }).splitChildTop("200px", { top: 100 })
layout.splitChildBottom("300px + 0.25vh", { bottom: 50 })

const
	canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d") as CanvasRenderingContext2D

canvas.setAttribute("style", "background-color: black;")
canvas.width = 800
canvas.height = 800
document.body.appendChild(canvas)
const animate = () => {
	ctx.clearRect(0, 0, 10000, 10000)
	layout.toPreview(ctx)
}
const animate_interval_id = setInterval(requestAnimationFrame, 1000 / 15, animate)

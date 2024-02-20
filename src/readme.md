# LayoutEngi
A reactive (signal-based) layout computation engine for organizing sprites.
Currently, it offers two layouts:
- [Grid based](/src/grid.ts)
- [Frame split based](/src/framesplit.ts)


## The Grid Layout:

### Features
- **Dynamic**: dynamically set the sizing configuration of each cell.
- **Reactive**: attach your reactive signal memos to `Grid.getCellFrames`, so that they are called whenever the grid layout gets recomputed. Or, call `Grid.setDirty()` to enforce a reactive recomputation.
- **Lazy**: when calling the Grid constructor, set the `lazy` parameter to `true`, and now, the grid layout will only be computed when both conditions below are met:
  1. the dirty signal `Grid.setDirty()` has been called at somepoint.
  2. something explicitly calls `Grid.getCellFrames` or its equivalents.
- **Batching**: you can temporarily pause the reactivity by calling `Grid.pauseReactivity()`, then execute a multitude of mutation operations, and then finally following it with a `Grid.resumeReactivity()` call.
- **Grid Origin Alignment**: the grid's origin (first-row-first-column) can be aligned to any of the rectangle's 4 corners (`"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"`), and can be changed dynamically.
- **Individual Column Based Config**: ability to set a different configuration for each column.
- **Individual Row Based Config**: ability to set a different configuration for row column.
- **Individual Cell Based Config**: ability to set a different configuration each individual cell.
- **Customizable Config**: row, column, or cell configurations are comprised of many options:
  - `colWidth` (default column width), `rowHeight` (default row height)
  - `colMinWidth` (column minimum width), `rowMinHeight` (row minimum height)
  - `colMaxWidth` (column maximum width), `rowMaxHeight` (row maximum height)
  - `colAlign` (left, center, or right alignment (or a float in-between `0` and `1`))
  - `rowAlign` (top, center, or bottom alignment (or a float in-between `0` and `1`))
  - `colGap` (pixel gap in between columns)
  - `rowAlign` (pixel gap in between rows)
- **2D Row and Column Operations**: ability to `push`, `pop`, `shift`, `unshift`, `splice`, or `rotate` (circulate) rows and columns.
- **Hit Testing**: perform hit testing to determine which cell a point belongs to within the grid.


### Usage

```ts
import { Grid } from "https://deno.land/x/layout_engi_ts/mod.ts"

// create a new grid instance
const grid = new Grid({
	cols: 3,
	rows: 0,
	originAlign: "right", // set the origin corner to top-right
	colAlign: ["end"], // right align all columns
	// add additional configuration options as needed
}, true) // specify if the reactivity will be lazy (computation will be deferred until something requests a value)

// push two new rows
grid.pushRows(
	[{}, {}, { width: 50, height: 20 }],
	[{}, { width: 30 }, {}],
)
// push one new column
grid.pushCols(
	[{ width: 20, anchor: { x: 0, y: 0 } }, { height: 40 },],
)
// remove one column from the beginning
grid.shiftCols(1)
// set content and alignment for a specific cell
grid.setCell(1, 1, { width: 100, height: 100, rowAlign: "center" })

// alternatively, we could've created the grid with the same setup using the `Grid.fromCells` static method
if (false) {
	const grid2 = Grid.fromCells([
		[{}, { width: 50, height: 20 }, { width: 20, anchor: { x: 0, y: 0 } }],
		[{ width: 30 }, { width: 100, height: 100, rowAlign: "center" }, { height: 40 }],
	], { originAlign: "right", colAlign: ["end"] })
}

// create a reactive signal that depends on `grid.getCellFrames()`
createMemo((id) => {
	const cell_frames = grid.getCellFrames(id)
	console.log(cell_frames)
}, { equals: false, defer: false })
// will log the following:
/*
[[
	{ left: 120, top: 0, right: 150, bottom: 20, x: 30, y: 0, width: 0, height: 0, rotation: undefined },
	{ left: 20, top: 0, right: 120, bottom: 20, x: 50, y: 0, width: 50, height: 20, rotation: undefined },
	{ left: 0, top: 0, right: 20, bottom: 20, x: 20, y: 0, width: 20, height: 0, rotation: undefined }
], [
	{ left: 120, top: 20, right: 150, bottom: 120, x: 0, y: 0, width: 30, height: 0, rotation: undefined },
	{ left: 20, top: 20, right: 120, bottom: 120, x: 0, y: 0, width: 100, height: 100, rotation: undefined },
	{ left: 0, top: 20, right: 20, bottom: 120, x: 20, y: 0, width: 0, height: 40, rotation: undefined }
],]
*/

// apply any kind of mutation to the `grid`, and your console will reactively log you with the new cell frames info
grid.shiftRows(1)
/*
[[
	{ left: 100, top: 0, right: 130, bottom: 100, x: 0, y: 0, width: 30, height: 0, rotation: undefined },
	{ left: 0, top: 0, right: 100, bottom: 100, x: 0, y: 0, width: 100, height: 100, rotation: undefined },
	{ left: 0, top: 0, right: 0, bottom: 100, x: 0, y: 0, width: 0, height: 40, rotation: undefined }
],]

// perform a hit test to determine the cell (row and column) on which a given pixel lies on
const row_and_col = grid.hit(50, 50)
if(row_and_col) {
	console.log("pixel (x, y) = (50, 50) lies on the row and column:", row_and_col[0], row_and_col[1])
	// will log: pixel (x, y) = (50, 50) lies on the row and column: 0 1
}
*/
```


## Documentation
See [github pages: https://omar-azmi.github.io/layout_engi_ts/](https://omar-azmi.github.io/layout_engi_ts/) for documentation.


## Demos
Check out some reactive demos here: [https://omar-azmi.github.io/layout_engi_ts/examples/](https://omar-azmi.github.io/layout_engi_ts/examples/).


## License
See the [license file](/src/license.md) for license.

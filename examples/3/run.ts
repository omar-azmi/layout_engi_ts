import { Grid } from "../../src/grid.ts"

// run example
const grid = Grid.fromCells([
	[{ width: 10, height: 10 }, { width: 5, height: 20 }, { width: 50, height: 2 }],
	[{ width: 9, height: 14 }, { width: 15, height: 40 }, { width: 52, height: 20 }],
	[{ width: 18, height: 77 }, { width: 95, height: 10 }, { width: 12, height: 44 }],
	[{ width: 1, height: 92 }, { width: 5, height: 14 }, { width: 10, height: 41 }],
], { colAlign: ["end"], rowAlign: ["center"] })

grid.getCellFrames()

const array_from = Array.from
const math_random = Math.random

const mapToObject = <MK extends PropertyKey, MV>(map: Map<MK, Iterable<MV>>): Record<MK, Array<MV>> => {
	const obj = {} as Record<MK, Array<MV>>
	map.forEach((value, key) => {
		obj[key] = array_from(value)
	})
	return obj
}

const randInt = (min: number, max: number) => ((math_random() * (max - min) + min) | 0)
const map_obj: Map<number, Set<number>> = new Map()
const add_random_entry = () => {
	map_obj.set(randInt(0, 2000), new Set(
		Array<number>(randInt(0, 200)).fill(0).map(
			() => randInt(-500, 500)
		)
	))
}
for (let i = 0; i < 500; i++) { add_random_entry() }


// test mapToObject
let obj = mapToObject(map_obj)
obj[12] ? (obj[12][0] += 1) : delete obj[12]
obj = undefined

// test structuredClone
let map_cloned = structuredClone(map_obj)
map_cloned.get(12) ? (map_cloned.get(12)!.add(-1)) : (map_cloned.set(12, new Set([5, 5, 5])))
map_cloned = undefined

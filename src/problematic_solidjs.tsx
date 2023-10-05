/** highlights solidjs's bad signal dependency management. <br>
 * solid playground repl at: [link](https://playground.solidjs.com/anonymous/622c376c-9312-49fe-bc65-498f7fcf61b8) <br>
 * try pressing the various combination of set signal buttons, and witness the incorrect callstack logged into the console. <br>
 * ideally, a memo must only be called AFTER all of its dependencies have been resolved,
 * however what ends up happening is that only the immediate observers of a signal/memo are called,
 * even if they have a dependency on an unresolved memo down the line. <br>
 * since signals and memos form a DAG (directed acyclic graph, aka dependency graph),
 * in theory there always exists an update path such that all dependencies are always resolved before hand.
 * this is called the topological order of a DAG. <br>
 * but since there is a little overhead and lookahead involved in figuring out this path, I guess the idea was not pursued. <br>
 * 
 * the graph of the signals/memos used in this example is illustrated below:
 * ```text
 * ┌──A  B   ┌──C
 * │  │  │   │  │
 * │  ▼  ▼   │  ▼
 * │  D─►E◄──┴──F
 * │  │  │      │
 * ▼  ▼  │      ▼
 * H◄─G◄─┘      I
 * ```
*/

import { render } from "solid-js/web"
import { createSignal, createMemo, createEffect, batch } from "solid-js"

function Counter() {

	const [A, setA] = createSignal(0, { equals: false })
	const [B, setB] = createSignal(1, { equals: false })
	const [C, setC] = createSignal(2, { equals: false })

	const callstack: string[] = []

	const D = createMemo(() => {
		callstack.push("D"); A()
	}, undefined, { equals: false })
	const F = createMemo(() => {
		callstack.push("F"); C()
	}, undefined, { equals: false })
	const E = createMemo(() => {
		callstack.push("E"); D(); B(); C(); F()
	}, undefined, { equals: false })
	const G = createMemo(() => {
		callstack.push("G"); E(); D()
	}, undefined, { equals: false })
	const H = createMemo(() => {
		callstack.push("H"); A(); G()
	}, undefined, { equals: false })
	const I = createMemo(() => {
		callstack.push("I"); C()
	}, undefined, { equals: false })

	createEffect(() => {
		A(); B(); C(); D(); E(); F(); G(); H(); I()
		console.log("callstack: ", ...callstack)
	})

	return (<>
		<button type="button" onClick={() => { callstack.splice(0); setA(0) }}>
			SetA
		</button>
		<button type="button" onClick={() => { callstack.splice(0); setB(1) }}>
			SetB
		</button>
		<button type="button" onClick={() => { callstack.splice(0); setC(2) }}>
			SetC
		</button>
		<br />
		<button type="button" onClick={() => batch(() => { callstack.splice(0); setA(0); setB(1) })}>
			BatchSet(A and B)
		</button>
		<button type="button" onClick={() => batch(() => { callstack.splice(0); setA(0); setC(2) })}>
			BatchSet(A and C)
		</button>
		<button type="button" onClick={() => batch(() => { callstack.splice(0); setB(1); setC(2) })}>
			BatchSet(B, C)
		</button>
		<br />
		<button type="button" onClick={() => batch(() => { callstack.splice(0); setA(0); setB(1); setC(2) })}>
			BatchSet(A, B, C)
		</button>
	</>)
}

console.clear()
render(() => <Counter />, document.getElementById("app")!)

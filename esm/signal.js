import { Context, LazySignal_Factory, MemoSignal_Factory, StateSignal_Factory, EffectSignal_Factory } from "./deps.js";
export { throttlingEquals } from "./deps.js";
// TODO: document what the the signals do to the end user, or refer them to `tsignal_ts`'s documentation
export const signalCtx = new Context(), createStateSignal = signalCtx.addClass(StateSignal_Factory), createMemoSignal = signalCtx.addClass(MemoSignal_Factory), createLazySignal = signalCtx.addClass(LazySignal_Factory), createEffectSignal = signalCtx.addClass(EffectSignal_Factory);
export const createState = (...args) => {
    return createStateSignal(...args).splice(1);
};
export const createMemo = (...args) => {
    return createMemoSignal(...args)[1];
};
export const createLazy = (...args) => {
    return createLazySignal(...args)[1];
};
export const createStateIfPrimitive = (value) => {
    return typeof value === "function" ?
        [value, undefined] :
        createState(value);
};
export class SignalingClass {
    /** create a computation signal. <br>
     * the signal will behave either {@link createMemo | lazily} or {@link createMemo | actively} based on
     * whether or not the `lazy` parameter was true when constructing the new instance.
    */
    comp;
    /** create a dependence of a computation on the default dirty signal provided by this class. */
    isDirty;
    /** declare this object to be dirty, so that computations can rerun if this class is not lazy.
     * otherwise, rerun lazily when something that depends on one of the computations tries to retrieve the value.
    */
    setDirty;
    paused = false;
    /** manually disable reactivity of {@link isDirty | `isDirty`} accessor, until unpasued by {@link resumeReactivity} */
    pauseReactivity() { this.paused = true; }
    /** resume reactivity of {@link isDirty | `isDirty`} accessor, if it had previously been pasued by {@link pauseReactivity} */
    resumeReactivity() { this.paused = false; }
    constructor(lazy) {
        const [isDirty, setDirty] = createState(undefined, { equals: () => { return this.paused; } });
        this.comp = lazy ? createLazy : createMemo;
        this.isDirty = isDirty;
        this.setDirty = setDirty;
    }
}

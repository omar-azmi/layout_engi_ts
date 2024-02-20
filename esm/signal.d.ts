import { Accessor, Setter } from "./deps.js";
export { throttlingEquals, type Accessor, type Setter } from "./deps.js";
export declare const signalCtx: any, createStateSignal: any, createMemoSignal: any, createLazySignal: any, createEffectSignal: any;
export declare const createState: <T>(...args: unknown[]) => [any, any];
export declare const createMemo: <T>(...args: unknown[]) => any;
export declare const createLazy: <T>(...args: unknown[]) => any;
export declare const createStateIfPrimitive: <T>(value: any) => [get: Accessor<T>, set?: any];
export declare class SignalingClass {
    /** create a computation signal. <br>
     * the signal will behave either {@link createMemo | lazily} or {@link createMemo | actively} based on
     * whether or not the `lazy` parameter was true when constructing the new instance.
    */
    protected comp: typeof createMemo | typeof createLazy;
    /** create a dependence of a computation on the default dirty signal provided by this class. */
    isDirty: Accessor<void>;
    /** declare this object to be dirty, so that computations can rerun if this class is not lazy.
     * otherwise, rerun lazily when something that depends on one of the computations tries to retrieve the value.
    */
    setDirty: Setter<void>;
    private paused;
    /** manually disable reactivity of {@link isDirty | `isDirty`} accessor, until unpasued by {@link resumeReactivity} */
    pauseReactivity(): void;
    /** resume reactivity of {@link isDirty | `isDirty`} accessor, if it had previously been pasued by {@link pauseReactivity} */
    resumeReactivity(): void;
    constructor(lazy: boolean);
}

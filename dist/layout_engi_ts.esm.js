// node_modules/kitchensink_ts/esm/_dnt.polyfills.js
if (!Object.hasOwn) {
  Object.defineProperty(Object, "hasOwn", {
    value: function(object, property) {
      if (object == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      return Object.prototype.hasOwnProperty.call(Object(object), property);
    },
    configurable: true,
    enumerable: false,
    writable: true
  });
}

// node_modules/kitchensink_ts/esm/builtin_aliases_deps.js
var noop = () => {
};
var array_isEmpty = (array) => array.length === 0;
var string_fromCharCode = String.fromCharCode;
var { from: array_from, isArray: array_isArray, of: array_of } = Array;
var { isInteger: number_isInteger, MAX_VALUE: number_MAX_VALUE, NEGATIVE_INFINITY: number_NEGATIVE_INFINITY, POSITIVE_INFINITY: number_POSITIVE_INFINITY } = Number;
var { assign: object_assign, defineProperty: object_defineProperty, entries: object_entries, fromEntries: object_fromEntries, keys: object_keys, getPrototypeOf: object_getPrototypeOf, values: object_values } = Object;
var date_now = Date.now;
var { iterator: symbol_iterator, toStringTag: symbol_toStringTag } = Symbol;

// node_modules/kitchensink_ts/esm/numericmethods.js
var clamp = (value, min2 = -number_MAX_VALUE, max2 = number_MAX_VALUE) => value < min2 ? min2 : value > max2 ? max2 : value;
var modulo = (value, mod) => (value % mod + mod) % mod;
var min = (v0, v1) => v0 < v1 ? v0 : v1;
var max = (v0, v1) => v0 > v1 ? v0 : v1;

// node_modules/kitchensink_ts/esm/array2d.js
var Array2DShape = (arr2d) => {
  const major_len = arr2d.length, minor_len = arr2d[0]?.length ?? 0;
  return [major_len, minor_len];
};
var transposeArray2D = (arr2d) => {
  const [rows, cols] = Array2DShape(arr2d), arr_transposed = [];
  for (let c = 0; c < cols; c++) {
    arr_transposed[c] = [];
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      arr_transposed[c][r] = arr2d[r][c];
    }
  }
  return arr_transposed;
};
var spliceArray2DMajor = (arr2d, start, delete_count, ...insert_items) => {
  const [rows, cols] = Array2DShape(arr2d);
  delete_count ??= max(rows - start, 0);
  return arr2d.splice(start, delete_count, ...insert_items);
};
var spliceArray2DMinor = (arr2d, start, delete_count, ...insert_items) => {
  const [rows, cols] = Array2DShape(arr2d), insert_items_rowwise = insert_items.length > 0 ? transposeArray2D(insert_items) : Array(rows).fill([]);
  delete_count ??= max(cols - start, 0);
  return transposeArray2D(arr2d.map((row_items, row) => row_items.splice(start, delete_count, ...insert_items_rowwise[row])));
};
var rotateArray2DMajor = (arr2d, amount) => {
  const [rows, cols] = Array2DShape(arr2d);
  amount = modulo(amount, rows === 0 ? 1 : rows);
  if (amount === 0) {
    return arr2d;
  }
  const right_removed_rows = spliceArray2DMajor(arr2d, rows - amount, amount);
  spliceArray2DMajor(arr2d, 0, 0, ...right_removed_rows);
  return arr2d;
};
var rotateArray2DMinor = (arr2d, amount) => {
  const [rows, cols] = Array2DShape(arr2d);
  amount = modulo(amount, cols === 0 ? 1 : cols);
  if (amount === 0) {
    return arr2d;
  }
  const right_removed_cols = spliceArray2DMinor(arr2d, cols - amount, amount);
  spliceArray2DMinor(arr2d, 0, 0, ...right_removed_cols);
  return arr2d;
};

// node_modules/kitchensink_ts/esm/struct.js
var constructorOf = (class_instance) => object_getPrototypeOf(class_instance).constructor;
var constructFrom = (class_instance, ...args) => new (constructorOf(class_instance))(...args);
var prototypeOfClass = (cls) => cls.prototype;
var monkeyPatchPrototypeOfClass = (cls, key, value) => {
  object_defineProperty(prototypeOfClass(cls), key, { value });
};

// node_modules/kitchensink_ts/esm/binder.js
var bindMethodFactoryByName = (instance, method_name, ...args) => {
  return (thisArg) => {
    return instance[method_name].bind(thisArg, ...args);
  };
};
var bindMethodToSelfByName = (self, method_name, ...args) => self[method_name].bind(self, ...args);
var array_proto = /* @__PURE__ */ prototypeOfClass(Array);
var map_proto = /* @__PURE__ */ prototypeOfClass(Map);
var set_proto = /* @__PURE__ */ prototypeOfClass(Set);
var bind_array_pop = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "pop");
var bind_array_push = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "push");
var bind_array_clear = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "splice", 0);
var bind_set_add = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "add");
var bind_set_clear = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "clear");
var bind_set_delete = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "delete");
var bind_set_has = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "has");
var bind_map_clear = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "clear");
var bind_map_delete = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "delete");
var bind_map_get = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "get");
var bind_map_set = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "set");

// node_modules/kitchensink_ts/esm/collections.js
var _a;
var Deque = class {
  /** a double-ended circular queue, similar to python's `collection.deque` <br>
   * @param length maximum length of the queue. <br>
   * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
  */
  constructor(length) {
    Object.defineProperty(this, "length", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: length
    });
    Object.defineProperty(this, "items", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "front", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "back", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "count", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    this.items = Array(length);
    this.back = length - 1;
  }
  /** inserts one or more items to the back of the deque. <br>
   * if the deque is full, it will remove the front item before adding a new item
  */
  pushBack(...items) {
    for (const item of items) {
      if (this.count === this.length)
        this.popFront();
      this.items[this.back] = item;
      this.back = modulo(this.back - 1, this.length);
      this.count++;
    }
  }
  /** inserts one or more items to the front of the deque. <br>
   * if the deque is full, it will remove the rear item before adding a new item
  */
  pushFront(...items) {
    for (const item of items) {
      if (this.count === this.length)
        this.popBack();
      this.items[this.front] = item;
      this.front = modulo(this.front + 1, this.length);
      this.count++;
    }
  }
  /** get the item at the back of the deque without removing/popping it */
  getBack() {
    if (this.count === 0)
      return void 0;
    return this.items[modulo(this.back + 1, this.length)];
  }
  /** get the item at the front of the deque without removing/popping it */
  getFront() {
    if (this.count === 0)
      return void 0;
    return this.items[modulo(this.front - 1, this.length)];
  }
  /** removes/pops the item at the back of the deque and returns it */
  popBack() {
    if (this.count === 0)
      return void 0;
    this.back = modulo(this.back + 1, this.length);
    const item = this.items[this.back];
    this.items[this.back] = void 0;
    this.count--;
    return item;
  }
  /** removes/pops the item at the front of the deque and returns it */
  popFront() {
    if (this.count === 0)
      return void 0;
    this.front = modulo(this.front - 1, this.length);
    const item = this.items[this.front];
    this.items[this.front] = void 0;
    this.count--;
    return item;
  }
  /** rotates the deque `steps` number of positions to the right. <br>
   * if `steps` is negative, then it will rotate in the left direction. <br>
   * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
  */
  rotate(steps) {
    const { front, back, length, count, items } = this;
    if (count === 0)
      return;
    steps = modulo(steps, count);
    if (count < length) {
      for (let i = 0; i < steps; i++) {
        const b = modulo(back - i, length), f = modulo(front - i - 1, length);
        items[b] = items[f];
        items[f] = void 0;
      }
    }
    this.front = modulo(front - steps, length);
    this.back = modulo(back - steps, length);
  }
  /** reverses the order of the items in the deque. */
  reverse() {
    const center = this.count / 2 | 0, { length, front, back, items } = this;
    for (let i = 1; i <= center; i++) {
      const b = modulo(back + i, length), f = modulo(front - i, length), temp = items[b];
      items[b] = items[f];
      items[f] = temp;
    }
  }
  /** provide an index with relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`. <br>
   * example: `this.items[this.resolveIndex(0)] === "rear most element of the deque"`
   * example: `this.items[this.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
  */
  resolveIndex(index) {
    return modulo(this.back + index + 1, this.length);
  }
  /** returns the item at the specified index.
   * @param index The index of the item to retrieve, relative to the rear-most element
   * @returns The item at the specified index, or `undefined` if the index is out of range
  */
  at(index) {
    return this.items[this.resolveIndex(index)];
  }
  /** replaces the item at the specified index with a new item. */
  replace(index, item) {
    this.items[modulo(this.back + index + 1, this.count)] = item;
  }
  /** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
   * if the deque is full, it removes the front item before adding the new item.
  */
  insert(index, item) {
    if (this.count === this.length)
      this.popFront();
    const i = this.resolveIndex(index);
    for (let j = this.front; j > i; j--)
      this.items[j] = this.items[j - 1];
    this.items[i] = item;
    this.count++;
  }
};
_a = Deque;
(() => {
  /* @__PURE__ */ monkeyPatchPrototypeOfClass(_a, symbol_iterator, function() {
    const count = this.count;
    let i = 0;
    return {
      next: () => i < count ? { value: this.at(i++), done: false } : { value: void 0, done: true }
    };
  });
})();

// node_modules/kitchensink_ts/esm/lambda.js
var THROTTLE_REJECT = /* @__PURE__ */ Symbol("a rejection by a throttled function");
var throttle = (delta_time_ms, fn) => {
  let last_call = 0;
  return (...args) => {
    const time_now = date_now();
    if (time_now - last_call > delta_time_ms) {
      last_call = time_now;
      return fn(...args);
    }
    return THROTTLE_REJECT;
  };
};

// node_modules/kitchensink_ts/esm/numericarray.js
var cumulativeSum = (arr) => {
  const len = arr.length, cum_sum = new (constructorOf(arr))(len + 1).fill(0);
  for (let i = 0; i < len; i++) {
    cum_sum[i + 1] = cum_sum[i] + arr[i];
  }
  return cum_sum;
};

// node_modules/tsignal_ts/esm/deps.js
var DEBUG;
(function(DEBUG3) {
  DEBUG3[DEBUG3["LOG"] = 0] = "LOG";
})(DEBUG || (DEBUG = {}));

// node_modules/tsignal_ts/esm/funcdefs.js
var default_equality = (v1, v2) => v1 === v2;
var falsey_equality = (v1, v2) => false;
var parseEquality = (equals) => equals === false ? falsey_equality : equals ?? default_equality;
var throttlingEquals = (delta_time_ms, base_equals) => {
  const base_equals_fn = parseEquality(base_equals), throttled_equals = throttle(delta_time_ms, base_equals_fn);
  return (prev_value, new_value) => {
    const is_equal = throttled_equals(prev_value, new_value);
    return is_equal === THROTTLE_REJECT ? true : is_equal;
  };
};
var hash_ids = (ids) => {
  const sqrt_len = ids.length ** 0.5;
  return ids.reduce((sum2, id) => sum2 + id * (id + sqrt_len), 0);
};
var log_get_request = DEBUG.LOG ? (all_signals_get, observed_id, observer_id) => {
  const observed_signal = all_signals_get(observed_id), observer_signal = observer_id ? all_signals_get(observer_id) : { name: "untracked" };
  console.log(
    "GET:	",
    observed_signal.name,
    "	by OBSERVER:	",
    observer_signal.name,
    // @ts-ignore:
    "	with VALUE	",
    observed_signal.value
  );
} : noop;

// node_modules/tsignal_ts/esm/typedefs.js
var SignalUpdateStatus;
(function(SignalUpdateStatus2) {
  SignalUpdateStatus2[SignalUpdateStatus2["ABORTED"] = -1] = "ABORTED";
  SignalUpdateStatus2[SignalUpdateStatus2["UNCHANGED"] = 0] = "UNCHANGED";
  SignalUpdateStatus2[SignalUpdateStatus2["UPDATED"] = 1] = "UPDATED";
})(SignalUpdateStatus || (SignalUpdateStatus = {}));

// node_modules/tsignal_ts/esm/signal.js
var SimpleSignal_Factory = (ctx) => {
  const { newId, getId, setId, addEdge } = ctx;
  return class SimpleSignal {
    constructor(value, { name, equals } = {}) {
      const id = newId();
      setId(id, this);
      this.id = id;
      this.rid = id;
      this.name = name;
      this.value = value;
      this.equals = parseEquality(equals);
    }
    get(observer_id) {
      if (observer_id) {
        addEdge(this.id, observer_id);
      }
      if (DEBUG.LOG) {
        log_get_request(getId, this.id, observer_id);
      }
      return this.value;
    }
    set(new_value) {
      const old_value = this.value;
      return !this.equals(old_value, this.value = typeof new_value === "function" ? new_value(old_value) : new_value);
    }
    run(forced) {
      return forced ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.UNCHANGED;
    }
    bindMethod(method_name) {
      return bindMethodToSelfByName(this, method_name);
    }
    static create(...args) {
      const new_signal = new this(...args);
      return [new_signal.id, new_signal];
    }
  };
};
var StateSignal_Factory = (ctx) => {
  const runId = ctx.runId;
  return class StateSignal extends ctx.getClass(SimpleSignal_Factory) {
    constructor(value, config) {
      super(value, config);
    }
    set(new_value) {
      const value_has_changed = super.set(new_value);
      if (value_has_changed) {
        runId(this.id);
        return true;
      }
      return false;
    }
    static create(value, config) {
      const new_signal = new this(value, config);
      return [
        new_signal.id,
        new_signal.bindMethod("get"),
        new_signal.bindMethod("set")
      ];
    }
  };
};
var MemoSignal_Factory = (ctx) => {
  return class MemoSignal extends ctx.getClass(SimpleSignal_Factory) {
    constructor(fn, config) {
      super(config?.value, config);
      this.fn = fn;
      if (config?.defer === false) {
        this.get();
      }
    }
    get(observer_id) {
      if (this.rid) {
        this.run();
        this.rid = 0;
      }
      return super.get(observer_id);
    }
    // TODO: consider whether or not MemoSignals should be able to be forced to fire independently
    run(forced) {
      return super.set(this.fn(this.rid)) ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.UNCHANGED;
    }
    static create(fn, config) {
      const new_signal = new this(fn, config);
      return [
        new_signal.id,
        new_signal.bindMethod("get")
      ];
    }
  };
};
var LazySignal_Factory = (ctx) => {
  return class LazySignal extends ctx.getClass(SimpleSignal_Factory) {
    constructor(fn, config) {
      super(config?.value, config);
      this.fn = fn;
      this.dirty = 1;
      if (config?.defer === false) {
        this.get();
      }
    }
    run(forced) {
      return this.dirty = 1;
    }
    get(observer_id) {
      if (this.rid || this.dirty) {
        super.set(this.fn(this.rid));
        this.dirty = 0;
        this.rid = 0;
      }
      return super.get(observer_id);
    }
    static create(fn, config) {
      const new_signal = new this(fn, config);
      return [
        new_signal.id,
        new_signal.bindMethod("get")
      ];
    }
  };
};
var EffectSignal_Factory = (ctx) => {
  const runId = ctx.runId;
  return class EffectSignal extends ctx.getClass(SimpleSignal_Factory) {
    constructor(fn, config) {
      super(void 0, config);
      this.fn = fn;
      if (config?.defer === false) {
        this.set();
      }
    }
    /** a non-untracked observer (which is what all new observers are) depending on an effect signal will result in the triggering of effect function.
     * this is an intentional design choice so that effects can be scaffolded on top of other effects.
     * TODO: reconsider, because you can also check for `this.rid !== 0` to determine that `this.fn` effect function has never run before, thus it must run at least once if the observer is not untracked_id
     * is it really necessary for us to rerun `this.fn` effect function for every new observer? it seems to create chaos rather than reducing it.
     * UPDATE: decided NOT to re-run on every new observer
     * TODO: cleanup this messy doc and redeclare how createEffect works
    */
    get(observer_id) {
      if (observer_id) {
        if (this.rid) {
          this.run();
        }
        super.get(observer_id);
      }
    }
    set() {
      const effect_will_fire_immediately = runId(this.id);
      return effect_will_fire_immediately;
    }
    run(forced) {
      const signal_should_propagate = this.fn(this.rid) !== false;
      if (this.rid) {
        this.rid = 0;
      }
      return signal_should_propagate ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.UNCHANGED;
    }
    static create(fn, config) {
      const new_signal = new this(fn, config);
      return [
        new_signal.id,
        new_signal.bindMethod("get"),
        new_signal.bindMethod("set")
      ];
    }
  };
};

// node_modules/tsignal_ts/esm/context.js
var Context = class {
  addEdge;
  delEdge;
  newId;
  getId;
  setId;
  delId;
  runId;
  swapId;
  clearCache;
  addClass;
  getClass;
  batch;
  dynamic;
  constructor() {
    let id_counter = 0, batch_nestedness = 0;
    const fmap = /* @__PURE__ */ new Map(), rmap = /* @__PURE__ */ new Map(), fmap_get = bind_map_get(fmap), rmap_get = bind_map_get(rmap), fmap_set = bind_map_set(fmap), rmap_set = bind_map_set(rmap), fmap_delete = bind_map_delete(fmap), rmap_delete = bind_map_delete(rmap);
    const ids_to_visit_cache = /* @__PURE__ */ new Map(), ids_to_visit_cache_get = bind_map_get(ids_to_visit_cache), ids_to_visit_cache_set = bind_map_set(ids_to_visit_cache), ids_to_visit_cache_clear = bind_map_clear(ids_to_visit_cache);
    const ids_to_visit_cache_create_new_entry = (source_ids) => {
      const to_visit = /* @__PURE__ */ new Set(), to_visit_add = bind_set_add(to_visit), to_visit_has = bind_set_has(to_visit);
      const dfs_visitor = (id) => {
        if (!to_visit_has(id)) {
          fmap_get(id)?.forEach(dfs_visitor);
          to_visit_add(id);
        }
      };
      source_ids.forEach(dfs_visitor);
      source_ids.forEach(bind_set_delete(to_visit));
      return [...to_visit, ...source_ids].reverse();
    };
    const get_ids_to_visit = (...source_ids) => {
      const hash = hash_ids(source_ids);
      return ids_to_visit_cache_get(hash) ?? (ids_to_visit_cache_set(hash, ids_to_visit_cache_create_new_entry(source_ids)) && ids_to_visit_cache_get(hash));
    };
    const all_signals = /* @__PURE__ */ new Map(), all_signals_get = bind_map_get(all_signals), all_signals_set = bind_map_set(all_signals), all_signals_delete = bind_map_delete(all_signals);
    const next_to_visit_this_cycle = /* @__PURE__ */ new Set(), next_to_visit_this_cycle_add = bind_set_add(next_to_visit_this_cycle), next_to_visit_this_cycle_delete = bind_set_delete(next_to_visit_this_cycle), next_to_visit_this_cycle_clear = bind_set_clear(next_to_visit_this_cycle);
    const not_to_visit_this_cycle = /* @__PURE__ */ new Set(), not_to_visit_this_cycle_add = bind_set_add(not_to_visit_this_cycle), not_to_visit_this_cycle_has = bind_set_has(not_to_visit_this_cycle), not_to_visit_this_cycle_clear = bind_set_clear(not_to_visit_this_cycle);
    const status_this_cycle = /* @__PURE__ */ new Map(), status_this_cycle_set = /* @__PURE__ */ bind_map_set(status_this_cycle), status_this_cycle_clear = /* @__PURE__ */ bind_map_clear(status_this_cycle);
    const postruns_this_cycle = [], postruns_this_cycle_push = bind_array_push(postruns_this_cycle), postruns_this_cycle_clear = bind_array_pop(postruns_this_cycle);
    const fireUpdateCycle = (...source_ids) => {
      next_to_visit_this_cycle_clear();
      not_to_visit_this_cycle_clear();
      if (DEBUG.LOG) {
        /* @__PURE__ */ status_this_cycle_clear();
      }
      source_ids.forEach(next_to_visit_this_cycle_add);
      let number_of_forced_ids = source_ids.length;
      const topological_ids = get_ids_to_visit(...source_ids);
      for (const source_id of topological_ids) {
        if (next_to_visit_this_cycle_delete(source_id) && !not_to_visit_this_cycle_has(source_id)) {
          const signal_update_status = executeSignal(source_id, number_of_forced_ids-- > 0);
          if (signal_update_status !== SignalUpdateStatus.UNCHANGED) {
            fmap_get(source_id)?.forEach(signal_update_status >= SignalUpdateStatus.UPDATED ? next_to_visit_this_cycle_add : not_to_visit_this_cycle_add);
          }
          if (DEBUG.LOG) {
            status_this_cycle_set(source_id, signal_update_status);
          }
        }
        if (next_to_visit_this_cycle.size <= 0) {
          break;
        }
      }
      if (DEBUG.LOG) {
        console.log("topological visiting ordering: ", [...status_this_cycle].map(([id, status]) => {
          return [all_signals_get(id).name, status];
        }));
      }
      if (DEBUG.LOG) {
        console.log("UPDATE_POSTRUNS:	", postruns_this_cycle);
      }
      let postrun_id;
      while (postrun_id = postruns_this_cycle_clear()) {
        all_signals_get(postrun_id)?.postrun();
      }
    };
    const executeSignal = (id, force) => {
      const forced = force === true, this_signal = all_signals_get(id), this_signal_update_status = this_signal?.run(forced) ?? SignalUpdateStatus.UNCHANGED;
      if (this_signal_update_status >= SignalUpdateStatus.UPDATED && this_signal.postrun) {
        postruns_this_cycle_push(id);
      }
      return this_signal_update_status;
    };
    const batched_ids = [], batched_ids_push = bind_array_push(batched_ids), batched_ids_clear = bind_array_clear(batched_ids);
    const startBatching = () => ++batch_nestedness;
    const endBatching = () => {
      if (--batch_nestedness <= 0) {
        batch_nestedness = 0;
        fireUpdateCycle(...batched_ids_clear());
      }
    };
    const scopedBatching = (fn, ...args) => {
      startBatching();
      const return_value = fn(...args);
      endBatching();
      return return_value;
    };
    this.addEdge = (src_id, dst_id) => {
      if (src_id + dst_id <= 0) {
        return false;
      }
      const forward_items = fmap_get(src_id) ?? (fmap_set(src_id, /* @__PURE__ */ new Set()) && fmap_get(src_id));
      if (!forward_items.has(dst_id)) {
        forward_items.add(dst_id);
        if (!rmap_get(dst_id)?.add(src_id)) {
          rmap_set(dst_id, /* @__PURE__ */ new Set([src_id]));
        }
        ids_to_visit_cache_clear();
        return true;
      }
      return false;
    };
    this.delEdge = (src_id, dst_id) => {
      if (fmap_get(src_id)?.delete(dst_id) && rmap_get(dst_id)?.delete(src_id)) {
        ids_to_visit_cache_clear();
        return true;
      }
      return false;
    };
    this.newId = () => {
      ids_to_visit_cache_clear();
      return ++id_counter;
    };
    this.getId = all_signals_get;
    this.setId = all_signals_set;
    this.delId = (id) => {
      if (all_signals_delete(id)) {
        const forward_items = fmap_get(id), reverse_items = rmap_get(id);
        forward_items?.forEach((dst_id) => {
          rmap_get(dst_id)?.delete(id);
        });
        reverse_items?.forEach((src_id) => {
          fmap_get(src_id)?.delete(id);
        });
        forward_items?.clear();
        reverse_items?.clear();
        fmap_delete(id);
        rmap_delete(id);
        ids_to_visit_cache_clear();
        return true;
      }
      return false;
    };
    this.swapId = (id1, id2) => {
      const signal1 = all_signals_get(id1), signal2 = all_signals_get(id2);
      all_signals_set(id1, signal2);
      all_signals_set(id2, signal1);
      if (signal1) {
        signal1.id = id2;
        if (signal1.rid) {
          signal1.rid = id2;
        }
      }
      if (signal2) {
        signal2.id = id1;
        if (signal2.rid) {
          signal2.rid = id1;
        }
      }
      ids_to_visit_cache_clear();
    };
    this.clearCache = ids_to_visit_cache_clear;
    this.runId = (id) => {
      const will_fire_immediately = batch_nestedness <= 0;
      if (will_fire_immediately) {
        fireUpdateCycle(id);
        return true;
      }
      batched_ids_push(id);
      return false;
    };
    const class_record = /* @__PURE__ */ new Map(), class_record_get = bind_map_get(class_record), class_record_set = bind_map_set(class_record);
    this.addClass = (factory_fn) => {
      const signal_class = this.getClass(factory_fn);
      return bindMethodToSelfByName(signal_class, "create");
    };
    this.getClass = (factory_fn) => {
      let signal_class = class_record_get(factory_fn);
      if (signal_class) {
        return signal_class;
      }
      signal_class = factory_fn(this);
      class_record_set(factory_fn, signal_class);
      return signal_class;
    };
    this.batch = { startBatching, endBatching, scopedBatching };
    this.dynamic = {
      setValue: (id, new_value) => {
        const signal = all_signals_get(id ?? 0);
        if (signal) {
          signal.value = new_value;
        }
      },
      setEquals: (id, new_equals) => {
        const signal = all_signals_get(id ?? 0);
        if (signal) {
          signal.equals = new_equals;
        }
      },
      setFn: (id, new_fn) => {
        const signal = all_signals_get(id ?? 0);
        if (signal) {
          signal.fn = new_fn;
        }
      }
    };
  }
};

// src/deps.ts
var number_isFinite = Number.isFinite;
var {
  abs: math_abs,
  cos: math_cos,
  max: math_max,
  sin: math_sin,
  random: math_random
} = Math;
var shuffleArray = (arr) => {
  const len = arr.length, rand_int = () => math_random() * len | 0, swap = (i1, i2) => {
    const temp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = temp;
  };
  for (let i = 0; i < len; i++)
    swap(i, rand_int());
  return arr;
};
var newArray2D = (rows, cols, fill_fn) => {
  const col_map_fn = typeof fill_fn === "function" ? () => Array(cols).fill(void 0).map(fill_fn) : () => Array(cols).fill(fill_fn);
  return Array(rows).fill(void 0).map(col_map_fn);
};
var shuffledDeque = function* (arr) {
  let i = arr.length;
  while (!array_isEmpty(arr)) {
    if (i >= arr.length) {
      i = 0;
      shuffleArray(arr);
    }
    i = max(i + ((yield arr[i]) ?? 1), 0);
  }
};

// src/funcdefs.ts
var alignmentToNumber = (alignment, reverse = false) => {
  if (typeof alignment === "string") {
    alignment = alignment === "start" ? 0 : alignment === "end" ? 1 : 0.5;
  }
  return reverse ? 1 - alignment : alignment;
};
var parseAlignments = (alignments, reverse = false) => {
  alignments = Array.isArray(alignments) ? alignments : [alignments];
  return alignments.map((v) => alignmentToNumber(v, reverse));
};
var zeroCumulativeSum = (arr) => {
  const cum_sum = cumulativeSum(arr);
  cum_sum.pop();
  return cum_sum;
};
var boundboxOfRotatedRect = (width, height, rotation) => {
  if (!rotation) {
    return { width, height };
  }
  const abs_cos_rot = math_abs(math_cos(rotation)), abs_sin_rot = math_abs(math_sin(rotation));
  return {
    width: width * abs_cos_rot + height * abs_sin_rot,
    height: width * abs_sin_rot + height * abs_cos_rot
  };
};
var parseLengthUnitLiteral = (str) => {
  const length_units = { px: 0, pw: 0, ph: 0 };
  for (const unit_str of str.split("+")) {
    const unit_str_trimmed = unit_str.trim(), value = +unit_str_trimmed.slice(0, -2), unit = unit_str_trimmed.slice(-2);
    length_units[unit] += value;
  }
  return length_units;
};
var parseLengthUnit = (length) => {
  if (typeof length === "object") {
    return length;
  }
  const px_only_length = Number(length);
  if (number_isFinite(px_only_length)) {
    return { px: px_only_length };
  }
  return parseLengthUnitLiteral(length);
};
var length_unit_name_iter = ["px", "pw", "ph"];
var stringifyLengthUnit = (length) => {
  const length_unit = parseLengthUnit(length);
  return length_unit_name_iter.map(
    (unit_name) => String(length_unit[unit_name] ?? 0) + unit_name
  ).join(" + ");
};

// src/signal.ts
var signalCtx = new Context();
var createStateSignal = signalCtx.addClass(StateSignal_Factory);
var createMemoSignal = signalCtx.addClass(MemoSignal_Factory);
var createLazySignal = signalCtx.addClass(LazySignal_Factory);
var createEffectSignal = signalCtx.addClass(EffectSignal_Factory);
var createState = (...args) => {
  return createStateSignal(...args).splice(1);
};
var createMemo = (...args) => {
  return createMemoSignal(...args)[1];
};
var createLazy = (...args) => {
  return createLazySignal(...args)[1];
};
var createStateIfPrimitive = (value) => {
  return typeof value === "function" ? [value, void 0] : createState(value);
};
var SignalingClass = class {
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
  pauseReactivity() {
    this.paused = true;
  }
  /** resume reactivity of {@link isDirty | `isDirty`} accessor, if it had previously been pasued by {@link pauseReactivity} */
  resumeReactivity() {
    this.paused = false;
  }
  constructor(lazy) {
    const [isDirty, setDirty] = createState(void 0, { equals: () => {
      return this.paused;
    } });
    this.comp = lazy ? createLazy : createMemo;
    this.isDirty = isDirty;
    this.setDirty = setDirty;
  }
};

// src/grid.ts
var Grid = class extends SignalingClass {
  cols;
  rows;
  originAlign;
  colWidth;
  rowHeight;
  colMinWidth;
  rowMinHeight;
  colMaxWidth;
  rowMaxHeight;
  colAlign;
  rowAlign;
  colGap;
  rowGap;
  cells;
  /** get the width of each column in the grid. the widths do not incorporate the length of any column-gaps in-between (invariant to it). */
  getColWidths = this.comp((id) => {
    this.isDirty(id);
    const { cols, colWidth, colMinWidth, colMaxWidth } = this, colWidth_len = colWidth.length, colMinWidth_len = colMinWidth.length, colMaxWidth_len = colMaxWidth.length, max_widths = Array(cols).fill(0);
    for (let c = 0; c < cols; c++) {
      const default_width = colWidth[c % colWidth_len], min_width = colMinWidth[c % colMinWidth_len], max_width = colMaxWidth[c % colMaxWidth_len];
      max_widths[c] = math_max(...this.getCol(c).map((cell) => {
        const { width: sprite_width, height: sprite_height = 0, rotation } = cell, width = sprite_width !== void 0 ? boundboxOfRotatedRect(sprite_width, sprite_height, rotation).width : default_width;
        return clamp(width, min_width, max_width);
      }));
    }
    return max_widths;
  }, { equals: false });
  /** get the height of each row in the grid. the heights do not incorporate the length of any row-gaps in-between (invariant to it). */
  getRowHeights = this.comp((id) => {
    this.isDirty(id);
    const { rows, rowHeight, rowMinHeight, rowMaxHeight } = this, rowHeight_len = rowHeight.length, rowMinHeight_len = rowMinHeight.length, rowMaxHeight_len = rowMaxHeight.length, max_heights = Array(rows).fill(0);
    for (let r = 0; r < rows; r++) {
      const default_height = rowHeight[r % rowHeight_len], min_height = rowMinHeight[r % rowMinHeight_len], max_height = rowMaxHeight[r % rowMaxHeight_len];
      max_heights[r] = math_max(...this.getRow(r).map((cell) => {
        const { width: sprite_width = 0, height: sprite_height, rotation } = cell, height = sprite_height !== void 0 ? boundboxOfRotatedRect(sprite_width, sprite_height, rotation).height : default_height;
        return clamp(height, min_height, max_height);
      }));
    }
    return max_heights;
  }, { equals: false });
  /** gives the left position of every column in a left-aligned grid-cell layout.
   * the length of the returned array is `this.cols + 1` (number of columns in grid + 1).
   * the first element is always `0`, because the first column always starts at `left = 0`.
   * the last element highlights the total width of the entire grid (sum of all column max-content-widths + column gaps).
  */
  get_left_positions = this.comp((id) => {
    const colWidths = this.getColWidths(id), colGap = this.colGap, colGap_len = colGap.length, column_plus_gap_widths = colWidths.map((col_width, c) => col_width + colGap[c % colGap_len]);
    return cumulativeSum(column_plus_gap_widths);
  }, { equals: false });
  /** gives the top position of every row in a top-aligned grid-cell layout.
   * the length of the returned array is `this.rows + 1` (number of rows in grid + 1).
   * the first element is always `0`, because the first row always starts at `top = 0`.
   * the last element highlights the total height of the entire grid (sum of all row max-content-heights + row gaps).
  */
  get_top_positions = this.comp((id) => {
    const rowHeights = this.getRowHeights(id), rowGap = this.rowGap, rowGap_len = rowGap.length, row_plus_gap_heights = rowHeights.map((row_height, r) => row_height + rowGap[r % rowGap_len]);
    return cumulativeSum(row_plus_gap_heights);
  }, { equals: false });
  /** computes the {@link CellFrameInfo | frameinfo} of each cell within the grid, assuming a top-left grid alignment direction.
   * meaning that the frame information computed here assumes that the first-row-first-column cell is placed at the top-left.
  */
  get_topleft_aligned_cell_frames = this.comp((id) => {
    const colWidths = this.getColWidths(id), rowHeights = this.getRowHeights(id), left_vals = this.get_left_positions(id), top_vals = this.get_top_positions(id), { rows, cols, cells, colAlign: colAlignGlobal, rowAlign: rowAlignGlobal } = this, colAlignGlobal_len = colAlignGlobal.length, rowAlignGlobal_len = rowAlignGlobal.length, cell_frames = newArray2D(rows, cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const left = left_vals[c], top = top_vals[r], thisColWidth = colWidths[c], thisRowHeight = rowHeights[r], right = left + thisColWidth, bottom = top + thisRowHeight, {
          width = 0,
          height = 0,
          rotation,
          anchor: { x: anchorSelfX, y: anchorSelfY } = {},
          colAlign = colAlignGlobal[c % colAlignGlobal_len],
          rowAlign = rowAlignGlobal[r % rowAlignGlobal_len]
        } = cells[r][c], colAlign_val = alignmentToNumber(colAlign), rowAlign_val = alignmentToNumber(rowAlign), anchorX = anchorSelfX ?? colAlign_val, anchorY = anchorSelfY ?? rowAlign_val, x = thisColWidth * colAlign_val - width * anchorX, y = thisRowHeight * rowAlign_val - height * anchorY;
        cell_frames[r][c] = {
          left,
          top,
          right,
          bottom,
          x,
          y,
          width,
          height,
          rotation
        };
      }
    }
    return cell_frames;
  }, { equals: false });
  /** get the total content-width of this grid.
   * it is simply the summation of all the {@link getColWidths | column-widths}, while also incorporating the in-between column-gap lengths.
  */
  width = this.comp((id) => {
    return this.get_left_positions(id).at(-1);
  }, { equals: false });
  /** get the total content-height of this grid.
   * it is simply the summation of all the {@link getRowHeights | row-heights}, while also incorporating the in-between row-gap lengths.
  */
  height = this.comp((id) => {
    return this.get_top_positions(id).at(-1);
  }, { equals: false });
  // TODO: the entire logic below can be incorporated into `get_topleft_aligned_cell_frames`, if we simply reverse the `get_left_positions()` and `get_top_positions()` when am alternate alignment is used.
  // but remember, the code may resemble a spaghetti if you do that.
  /** computes the {@link CellFrameInfo | frameinfo} of each cell within the grid. */
  getCellFrames = this.comp((id) => {
    const cell_frames = this.get_topleft_aligned_cell_frames(id), grid_total_width = this.width(id), grid_total_height = this.height(id), { rows, cols, originAlign } = this;
    const reverse_horizontal = originAlign.includes("right"), reverse_vertical = originAlign.includes("bottom");
    if (reverse_horizontal || reverse_vertical) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell_frame = cell_frames[r][c], { top, left, bottom, right } = cell_frame;
          if (reverse_horizontal) {
            cell_frame.right = grid_total_width - left;
            cell_frame.left = grid_total_width - right;
          }
          if (reverse_vertical) {
            cell_frame.bottom = grid_total_height - top;
            cell_frame.top = grid_total_height - bottom;
          }
        }
      }
    }
    if (0 /* LOG */) {
      console.log("recomputing getCellFrames");
    }
    return cell_frames;
  }, { equals: false });
  constructor(config, lazy = false) {
    super(lazy);
    const {
      rows,
      cols,
      originAlign = "",
      colWidth = [0],
      rowHeight = [0],
      colMinWidth = [0],
      rowMinHeight = [0],
      colMaxWidth = [number_POSITIVE_INFINITY],
      rowMaxHeight = [number_POSITIVE_INFINITY],
      colAlign = ["start"],
      rowAlign = ["start"],
      colGap = [0],
      rowGap = [0]
    } = config, cells = newArray2D(rows, cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells[r][c] = {};
      }
    }
    Object.assign(this, {
      rows,
      cols,
      originAlign,
      colWidth,
      rowHeight,
      colGap,
      rowGap,
      colMinWidth,
      rowMinHeight,
      colMaxWidth,
      rowMaxHeight,
      cells,
      colAlign: parseAlignments(colAlign),
      rowAlign: parseAlignments(rowAlign)
    });
    this.getCellFrames();
  }
  getCellFrame(row, col) {
    const { rows, cols, getCellFrames } = this;
    return getCellFrames()[row % rows][col % cols];
  }
  getRow(row) {
    return this.cells[row];
  }
  getCol(col) {
    return this.cells.map((row) => row[col]);
  }
  getCell(row, col) {
    return this.cells[row][col];
  }
  setCell(row, col, value) {
    this.cells[row][col] = value;
    this.setDirty();
  }
  /** splice `delete_count` number of rows from the grid, starting with row number `start`. <br>
   * optionally insert `insert_rows_of_cells` in place of deleted rows (beginning from `start` index). <br>
   * the row-major grid of deleted cells is then returned. <br>
   * also, a dirty signal is triggered in the end of the process.
  */
  spliceRows(start, delete_count, ...insert_rows_of_cells) {
    const { cells, setDirty } = this, deleted_rows = spliceArray2DMajor(cells, start, delete_count, ...insert_rows_of_cells), [new_rows, new_cols] = Array2DShape(cells);
    this.rows = new_rows;
    setDirty();
    return deleted_rows;
  }
  /** splice `delete_count` number of columns from the grid, starting with column number `start`. <br>
   * optionally insert `cols_of_cells` in place of deleted columns (beginning from `start` index). <br>
   * the column-major grid of deleted cells is then returned. <br>
   * also, a dirty signal is triggered in the end of the process.
  */
  spliceCols(start, delete_count, ...cols_of_cells) {
    const { cells, setDirty } = this, deleted_cols = spliceArray2DMinor(cells, start, delete_count, ...cols_of_cells), [new_rows, new_cols] = Array2DShape(cells);
    this.cols = new_cols;
    setDirty();
    return deleted_cols;
  }
  rotateRows(amount) {
    const { cells, setDirty } = this;
    rotateArray2DMajor(cells, amount);
    setDirty();
    return;
  }
  rotateCols(amount) {
    const { cells, setDirty } = this;
    rotateArray2DMinor(cells, amount);
    setDirty();
    return;
  }
  /** push in row-major grid of cells to increase row size. also triggers a dirty signal */
  pushRows(...rows_of_cells) {
    const { rows, cols } = this, [rows_added, cols_added] = Array2DShape(rows_of_cells), total_rows = rows + rows_added;
    if (cols_added !== cols) {
      if (0 /* ERROR */) {
        console.error(`number of columns mismatched. cannot push new rows with ${cols_added} columns onto existing grid with ${cols} columns`);
      }
      return rows;
    }
    this.spliceRows(rows, 0, ...rows_of_cells);
    if (0 /* ASSERT */) {
      console.assert(this.rows === total_rows);
    }
    return total_rows;
  }
  /** push in column-major grid of cells to increase column size. also triggers a dirty signal */
  pushCols(...cols_of_cells) {
    const { rows, cols } = this, [cols_added, rows_added] = Array2DShape(cols_of_cells), total_cols = cols + cols_added;
    if (rows_added !== rows) {
      if (0 /* ERROR */) {
        console.error(`number of rows mismatched. cannot push new cols with ${rows_added} rows onto existing grid with ${rows} rows`);
      }
      return cols;
    }
    this.spliceCols(cols, 0, ...cols_of_cells);
    if (0 /* ASSERT */) {
      console.assert(this.cols === total_cols);
    }
    return total_cols;
  }
  /** unshift (left push) in row-major grid of cells to increase row size. also triggers a dirty signal */
  unshiftRows(...rows_of_cells) {
    const { rows, cols } = this, [rows_added, cols_added] = Array2DShape(rows_of_cells), total_rows = rows + rows_added;
    if (cols_added !== cols) {
      if (0 /* ERROR */) {
        console.error(`number of columns mismatched. cannot unshift new rows with ${cols_added} columns onto existing grid with ${cols} columns`);
      }
      return rows;
    }
    this.spliceRows(0, 0, ...rows_of_cells);
    if (0 /* ASSERT */) {
      console.assert(this.rows === total_rows);
    }
    return total_rows;
  }
  /** unshift (left push) column-major grid of cells to increase column size. also triggers a dirty signal */
  unshiftCols(...cols_of_cells) {
    const { rows, cols } = this, [cols_added, rows_added] = Array2DShape(cols_of_cells), total_cols = cols + cols_added;
    if (rows_added !== rows) {
      if (0 /* ERROR */) {
        console.error(`number of rows mismatched. cannot unshift new cols with ${rows_added} rows onto existing grid with ${rows} rows`);
      }
      return cols;
    }
    this.spliceCols(0, 0, ...cols_of_cells);
    if (0 /* ASSERT */) {
      console.assert(this.cols === total_cols);
    }
    return total_cols;
  }
  /** pop `amount` number of rows from the grid, and return a grid of row-major cells. also triggers a dirty signal */
  popRows(amount = 1) {
    return this.spliceRows(this.rows - amount, amount);
  }
  /** pop `amount` number of cols from the grid, and return a grid of column-major cells. also triggers a dirty signal */
  popCols(amount = 1) {
    return this.spliceCols(this.cols - amount, amount);
  }
  /** shift (left pop) `amount` number of rows from the grid, and return a grid of row-major cells. also triggers a dirty signal */
  shiftRows(amount = 1) {
    return this.spliceRows(0, amount);
  }
  /** shift (left pop) `amount` number of cols from the grid, and return a grid of column-major cells. also triggers a dirty signal */
  shiftCols(amount = 1) {
    return this.spliceCols(0, amount);
  }
  static fromCells(cells, config) {
    const [rows, cols] = Array2DShape(cells), grid = new this({ rows: 0, cols, ...config });
    grid.pushRows(...cells);
    return grid;
  }
  /** do a hit test on the grid, relative to its top-left coordinates.
   * the returned value is `[row_number, column_number]` if a cell is successfully hit, otherwise an `undefined` is returned.
   * the hit does **not** check if the sprite within a {@link CellFrameInfo | cell frame} is being hit.
   * it will return a row and column values if a the gap in-between cell sprites is hit.
   * you will have to check whether the sprite's rect is being hit or not by yourself.
  */
  hit(x, y) {
    const originAlign = this.originAlign, reverse_horizontal = originAlign.includes("right"), reverse_vertical = originAlign.includes("bottom"), left_vals = this.get_left_positions(), top_vals = this.get_top_positions(), grid_total_width = left_vals.at(-1), grid_total_height = top_vals.at(-1);
    x = reverse_horizontal ? grid_total_width - x : x;
    y = reverse_vertical ? grid_total_height - y : y;
    if (x < 0 || x > grid_total_width || y < 0 || y > grid_total_height) {
      return void 0;
    }
    const col = x === 0 ? 0 : left_vals.findIndex((left_bound) => x <= left_bound) - 1, row = y === 0 ? 0 : top_vals.findIndex((top_bound) => y <= top_bound) - 1;
    return [row, col];
  }
  // TODO: implement this debug-only method, with an implementation similar to {@link FrameSplit.toPreview}
  toPreview(ctx, color) {
  }
};

// src/framesplit.ts
var ltrb_iter = ["left", "top", "right", "bottom"];
var colors = ["aqua", "aquamarine", "antiquewhite", "blue", "brown", "blueviolet", "chartreuse", "crimson", "darkkhaki", "darkorange", "darksalmon", "fuchsia", "gold", "green", "orangered", "yellow", "yellowgreen"];
var pick_color_iter = shuffledDeque(colors);
var FrameSplit = class {
  children = [];
  constructor(left, top, right, bottom) {
    const ltrb = [left, top, right, bottom], set = {};
    for (let i = 0; i < 4; i++) {
      const dim_name = ltrb_iter[i], dim = ltrb[i], [dim_getter, dim_setter] = createStateIfPrimitive(dim);
      this[dim_name] = dim_getter;
      set[dim_name] = dim_setter;
    }
    this.set = set;
  }
  getFreespaceChild() {
    const { children } = this, len = children.length;
    if (len > 0) {
      return children[0];
    }
    const { left, top, right, bottom } = this, freespace_child = constructFrom(this, left, top, right, bottom);
    children.push(freespace_child);
    return freespace_child;
  }
  splitChildLeft(width, margin = {}) {
    margin.left ??= 0;
    margin.right ??= 0;
    const freespace = this.getFreespaceChild(), { left, top, right, bottom } = freespace, [getWidth, setWidth] = createStateIfPrimitive(parseLengthUnit(width)), [getMargin, setMargin] = createStateIfPrimitive({ ...margin, top: 0, bottom: 0 }), child_left = createMemo((id) => {
      const { left: ml = 0, right: mr = 0 } = getMargin(id);
      return min(left(id) + ml, right(id) - mr);
    }), child_right = createMemo((id) => {
      const { left: ml = 0, right: mr = 0 } = getMargin(id), l = left(id) + ml, r = max(right(id) - mr, l), t = top(id), b = bottom(id), { px = 0, pw = 0, ph = 0 } = getWidth(id);
      return min(l + px + (r - l) * pw + (b - t) * ph, r);
    }), child_framesplit = constructFrom(this, child_left, top, child_right, bottom);
    child_framesplit.margin = getMargin;
    child_framesplit.width = getWidth;
    child_framesplit.set.margin = setMargin;
    child_framesplit.set.width = setWidth;
    freespace.left = createMemo((id) => min(child_right(id) + getMargin(id).right, right(id)));
    this.children.push(child_framesplit);
    return child_framesplit;
  }
  splitChildTop(height, margin = {}) {
    margin.top ??= 0;
    margin.bottom ??= 0;
    const freespace = this.getFreespaceChild(), { left, top, right, bottom } = freespace, [getHeight, setHeight] = createStateIfPrimitive(parseLengthUnit(height)), [getMargin, setMargin] = createStateIfPrimitive({ ...margin, left: 0, right: 0 }), child_top = createMemo((id) => {
      const { top: mt = 0, bottom: mb = 0 } = getMargin(id);
      return min(top(id) + mt, bottom(id) - mb);
    }), child_bottom = createMemo((id) => {
      const { top: mt = 0, bottom: mb = 0 } = getMargin(), l = left(id), r = right(id), t = top(id) + mt, b = max(bottom(id) - mb, t), { px = 0, pw = 0, ph = 0 } = getHeight(id);
      return min(t + px + (r - l) * pw + (b - t) * ph, b);
    }), child_framesplit = constructFrom(this, left, child_top, right, child_bottom);
    child_framesplit.margin = getMargin;
    child_framesplit.height = getHeight;
    child_framesplit.set.margin = setMargin;
    child_framesplit.set.height = setHeight;
    freespace.top = createMemo((id) => min(child_bottom(id) + getMargin(id).bottom, bottom(id)));
    this.children.push(child_framesplit);
    return child_framesplit;
  }
  splitChildRight(width, margin = {}) {
    margin.left ??= 0;
    margin.right ??= 0;
    const freespace = this.getFreespaceChild(), { left, top, right, bottom } = freespace, [getWidth, setWidth] = createStateIfPrimitive(parseLengthUnit(width)), [getMargin, setMargin] = createStateIfPrimitive({ ...margin, top: 0, bottom: 0 }), child_left = createMemo((id) => {
      const { left: ml = 0, right: mr = 0 } = getMargin(id), l = left(id) + ml, r = max(right(id) - mr, l), t = top(id), b = bottom(id), { px = 0, pw = 0, ph = 0 } = getWidth(id);
      return max(r - px - (r - l) * pw - (b - t) * ph, l);
    }), child_right = createMemo((id) => {
      const { left: ml = 0, right: mr = 0 } = getMargin(id);
      return max(left(id) + ml, right(id) - mr);
    }), child_framesplit = constructFrom(this, child_left, top, child_right, bottom);
    child_framesplit.margin = getMargin;
    child_framesplit.width = getWidth;
    child_framesplit.set.margin = setMargin;
    child_framesplit.set.width = setWidth;
    freespace.right = createMemo((id) => max(child_left(id) + getMargin(id).left, left(id)));
    this.children.push(child_framesplit);
    return child_framesplit;
  }
  splitChildBottom(height, margin = {}) {
    margin.top ??= 0;
    margin.bottom ??= 0;
    const freespace = this.getFreespaceChild(), { left, top, right, bottom } = freespace, [getHeight, setHeight] = createStateIfPrimitive(parseLengthUnit(height)), [getMargin, setMargin] = createStateIfPrimitive({ ...margin, left: 0, right: 0 }), child_top = createMemo((id) => {
      const { top: mt = 0, bottom: mb = 0 } = getMargin(id), l = left(id), r = right(id), t = top(id) + mt, b = max(bottom(id) - mb, t), { px = 0, pw = 0, ph = 0 } = getHeight(id);
      return max(b - px - (r - l) * pw - (b - t) * ph, t);
    }), child_bottom = createMemo((id) => {
      const { top: mt = 0, bottom: mb = 0 } = getMargin(id);
      return max(top(id) + mt, bottom(id) - mb);
    }), child_framesplit = constructFrom(this, left, child_top, right, child_bottom);
    child_framesplit.margin = getMargin;
    child_framesplit.height = getHeight;
    child_framesplit.set.margin = setMargin;
    child_framesplit.set.height = setHeight;
    freespace.bottom = createMemo((id) => max(child_top(id) + getMargin(id).top, top(id)));
    this.children.push(child_framesplit);
    return child_framesplit;
  }
  // TODO: I think this method belongs either to a subclass, or a separate function that takes `this` as the first argument.
  /** hit test to see if this frame, or any of its deep children, get hit by the `(x, y)` coordinates. <br>
   * the deepest child hit by the hit ray will be returned, and an `undefined` will be returned if nothing was hit.
  */
  hit(x, y) {
    if (this.left() <= x && x <= this.right() && this.top() <= y && y <= this.bottom()) {
      const children = this.children, children_len = children.length;
      let deep_child_that_has_been_hit, i = 0;
      while (++i < children_len) {
        if (deep_child_that_has_been_hit = children[i].hit(x, y)) {
          break;
        }
      }
      return deep_child_that_has_been_hit ?? this;
    }
    return;
  }
  // TODO: this debugging method should either exist in a subclass or a separate function that takes `this` as the first argument.
  toString() {
    const { left, top, right, bottom, margin, width, height, set, children } = this, setters = [], obj = {
      setters,
      position: [left(), top(), right(), bottom()]
    };
    for (const key in set) {
      if (set[key] !== void 0) {
        setters.push(key);
      }
    }
    if (margin) {
      const { left: left2, top: top2, right: right2, bottom: bottom2 } = margin();
      obj.margin = [left2, top2, right2, bottom2];
    }
    if (width) {
      obj.width = width();
    }
    if (height) {
      obj.height = height();
    }
    if (children.length > 0) {
      obj.children = children.map((v) => v.toString());
    }
    return obj;
  }
  // TODO: this helper method needs to be placed in a separate subclass, or perhaps as a subclass in one of the tests,
  // or perhaps as a debug-only option, or perhaps define it as a separate function that takes an instance of this class as the first argument.
  toPreview(ctx, color) {
    const children = this.children, children_len = children.length;
    if (children_len <= 1 || color) {
      const { left, top, right, bottom } = this, x = left(), y = top(), w = right() - x, h = bottom() - y;
      ctx.fillStyle = color ?? pick_color_iter.next().value;
      ctx.fillRect(x, y, w, h);
    }
    for (let ch = 0; ch < children_len; ch++) {
      children[ch].toPreview(ctx, ch === 0 ? color ?? "gray" : void 0);
    }
  }
};
export {
  FrameSplit,
  Grid,
  SignalingClass,
  alignmentToNumber,
  boundboxOfRotatedRect,
  createEffectSignal,
  createLazy,
  createLazySignal,
  createMemo,
  createMemoSignal,
  createState,
  createStateIfPrimitive,
  createStateSignal,
  parseAlignments,
  parseLengthUnit,
  pick_color_iter,
  signalCtx,
  stringifyLengthUnit,
  throttlingEquals,
  zeroCumulativeSum
};

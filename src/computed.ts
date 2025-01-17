import { effect, track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import type { Ref } from "./ref";

export type ComputedGetter<T> = (oldValue?: T) => T;
export type ComputedSetter<T> = (newValue: T) => void;

export interface WritableComputedOptions<T, S = T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<S>;
}

interface ComputedRef<T> {
  readonly value: T;
}

interface WritableComputedRef<T, S = T> extends Ref<T, S> {}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>;
export function computed<T, S = T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T, S>;

export function computed<T>(
  options: ComputedGetter<T> | WritableComputedOptions<T>
): ComputedRef<T> | WritableComputedRef<T> {
  let getter: ComputedGetter<T>, setter: ComputedSetter<T>;
  if (typeof options === "function") {
    getter = options;
    setter = () => {
      console.warn("Computed value is readonly");
    };
  } else {
    getter = options.get;
    setter = options.set;
  }

  let value: T;
  let dirty = true;

  const effectFn = effect(
    () => {
      value = getter();
      dirty = false;
    },
    { lazy: true }
  );

  return {
    get value() {
      if (dirty) {
        effectFn();
      }
      track(this, TrackOpTypes.GET, "value");
      return value;
    },
    set value(newValue: T) {
      setter(newValue);
      dirty = true;
      trigger(this, TriggerOpTypes.SET, "value");
    },
  };
}

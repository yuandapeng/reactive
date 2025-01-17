import { track, trigger } from "./effect";
import { TriggerOpTypes, TrackOpTypes } from "./operations";
import { reactive } from "./reactive";
import { hasChanged, isObject } from "./utils";

export interface Ref<T = any, S = T> {
  get value(): T;
  set value(_: S);
}

export const ref = <T = any>(value: T): Ref<T> => {
  let wrappedValue = isObject(value) ? reactive(value) : value;
  return {
    get value(): T {
      track(this, TrackOpTypes.GET, "value");
      return wrappedValue;
    },
    set value(newValue) {
      if (hasChanged(value, newValue)) {
        if (isObject(newValue)) {
          wrappedValue = reactive(newValue);
        } else {
          wrappedValue = newValue;
        }
        trigger(this, TriggerOpTypes.SET, "value");
      }
    },
  };
};

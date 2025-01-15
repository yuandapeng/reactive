import { track, trigger } from "./effect.js";
import { TriggerOpTypes, TrackOpTypes } from "./operations.js";
import { reactive } from "./reactive.js";
import { hasChanged, isObject } from "./utils.js";

export const ref = (value) => {
  let wrappedValue = isObject(value) ? reactive(value) : value;
  return {
    get value() {
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

import { track, trigger } from "./effect";
import { TriggerOpTypes, TrackOpTypes } from "./operations";
import { reactive } from "./reactive";
import { hasChanged, isObject } from "./utils";
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

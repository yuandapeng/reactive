import { effect, track, trigger } from "./effect.js";
import { TrackOpTypes, TriggerOpTypes } from "./operations.js";

export const computed = (options) => {
  let getter, setter;

  if (typeof options === "function") {
    getter = options;
  } else {
    getter = options.get;
    setter = options.set;
  }
  let value;
  effect(() => {
    value = getter();
  });

  return {
    get value() {
      track(this, TrackOpTypes.GET, "value");
      return value;
    },
    set value(newValue) {
      setter && setter(newValue);
      trigger(this, TriggerOpTypes.SET, "value");
    },
  };
};

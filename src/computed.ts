import { effect, track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";

export function computed(options) {
  let getter, setter;
  if (typeof options === 'function') {
    getter = options;
    setter = () => {
      console.warn('Computed value is readonly');
    };
  } else {
    getter = options.get;
    setter = options.set;
  }

  let value;
  let dirty = true;

  const effectFn = effect(() => {
    if (dirty) {
      value = getter();
      dirty = false;
    }
  }, { lazy: true });

  return {
    get value() {
      if (dirty) {
        effectFn();
      }
      track(this, TrackOpTypes.GET, "value");
      return value;
    },
    set value(newValue) {
      setter(newValue);
      dirty = true;
      trigger(this, TriggerOpTypes.SET, "value");
    }
  };
}

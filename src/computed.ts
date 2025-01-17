import { effect, track, trigger } from "./effect";
import { TrackOpTypes } from "./operations";

export function computed(getter) {
  let value;
  let dirty = true;

  const effectFn = () => effect(() => {
    if (dirty) {
      value = getter();
      dirty = false;
    }
  });

  return {
    get value() {
      if (dirty) {
        effectFn();
      }
      track(effectFn, TrackOpTypes.GET, "value");
      return value;
    }
  };
}

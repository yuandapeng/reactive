import { TrackOpTypes, TriggerOpTypes } from "./operations.js";

let activeEffect;

const targetMap = new WeakMap(); // 若引用

const ITERATE_KEY = Symbol("iterate");

export const effect = (fn) => {
  const effectFn = () => {
    activeEffect = effectFn;
    try {
      return fn();
    } finally {
      activeEffect = null;
    }
  };
  effectFn();
};

let shouldTrack = true;

export function pauseTracking() {
  shouldTrack = false;
}

export function resumeTracking() {
  shouldTrack = true;
}

export function track(target, type, key) {
  if (!shouldTrack || !activeEffect) {
    return;
  }

  if (type === TrackOpTypes.ITERATE) {
    // 数组的迭代器
    key = ITERATE_KEY;
  }

  let propMap = targetMap.get(target);
  if (!propMap) {
    propMap = new Map();
    targetMap.set(target, propMap);
  }

  let typeMap = propMap.get(key);

  if (!typeMap) {
    typeMap = new Map();
    propMap.set(key, typeMap);
  }

  let depSet = targetMap.get(type);

  if (!depSet) {
    depSet = new Set();
    typeMap.set(type, depSet);
  }

  if (!depSet.has(activeEffect)) {
    depSet.add(activeEffect);
  }
}

export function trigger(target, type, key) {
  const effectFns = getEffectFns(target, type, key);
  if (!effectFns) return;

  for (const effectFn of effectFns) {
    effectFn();
  }
}

export function getEffectFns(target, type, key) {
  const propMap = targetMap.get(target);

  if (!propMap) {
    return;
  }

  const keys = [key];

  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    // 添加或者删除时, 触发的key为ITERATE_KEY
    keys.push(ITERATE_KEY);
  }

  const effectFns = new Set();

  const TriggerOpTypesMap = {
    [TriggerOpTypes.ADD]: [
      TrackOpTypes.GET,
      TrackOpTypes.HAS,
      TrackOpTypes.ITERATE,
    ],
    [TriggerOpTypes.DELETE]: [
      TrackOpTypes.GET,
      TrackOpTypes.HAS,
      TrackOpTypes.ITERATE,
    ],
    [TriggerOpTypes.SET]: [TrackOpTypes.GET],
  };

  for (const key of keys) {
    const typeMap = propMap.get(key);
    if (!typeMap) {
      continue;
    }
    const trackTypes = TriggerOpTypesMap[type]; // 触发类型
    for (const trackType of trackTypes) {
      const dep = typeMap.get(trackType);
      if (!dep) {
        continue;
      }
      for (const effectFn of dep) {
        effectFns.add(effectFn);
      }
    }
  }

  return effectFns;
}

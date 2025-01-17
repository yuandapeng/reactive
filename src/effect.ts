import { TrackOpTypes, TriggerOpTypes } from "./operations";

// 利用条件类型和 keyof 操作符筛选出所需的键
type GetEnumValues<T> = T[keyof T];

interface EffectFn {
  (): void;
  deps: Set<EffectFn>[];
}

let activeEffect: EffectFn | null;

const targetMap = new WeakMap<
  object,
  Map<
    string | symbol,
    Map<GetEnumValues<GetEnumValues<typeof TrackOpTypes>>, Set<EffectFn>>
  >
>(); // 若引用

const ITERATE_KEY = Symbol("iterate");

export const effect = (fn, options = { lazy: false }) => {
  const effectFn: EffectFn | null = () => {
    activeEffect = effectFn;
    try {
      cleanup(effectFn!);
      return fn();
    } finally {
      activeEffect = null;
    }
  };
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn; // Return the effect function
};

export function cleanup(effectFn: EffectFn) {
  const { deps } = effectFn;
  for (const dep of deps) {
    if (dep.has(effectFn)) {
      dep.delete(effectFn);
    }
  }
}

let shouldTrack = true;

export function pauseTracking() {
  shouldTrack = false;
}

export function resumeTracking() {
  shouldTrack = true;
}

export function track(
  target: object,
  type: GetEnumValues<typeof TrackOpTypes>,
  key?: string | symbol
) {
  if (!shouldTrack || !activeEffect) {
    return;
  }

  if (type === TrackOpTypes.ITERATE) {
    // 数组的迭代器
    key = ITERATE_KEY;
  }

  key = key ?? ITERATE_KEY;

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

  let depSet = typeMap.get(type);

  if (!depSet) {
    depSet = new Set<EffectFn>();
    typeMap.set(type, depSet);
  }

  if (!depSet.has(activeEffect)) {
    depSet.add(activeEffect);
    activeEffect.deps.push(depSet);
  }
}

export function trigger(
  target: object,
  type: GetEnumValues<typeof TriggerOpTypes>,
  key: string | symbol
) {
  const effectFns = getEffectFns(target, type, key);
  if (!effectFns) return;

  for (const effectFn of effectFns) {
    effectFn();
  }
}

export function getEffectFns(
  target: object,
  type: GetEnumValues<typeof TriggerOpTypes>,
  key: string | symbol
) {
  const propMap = targetMap.get(target);

  if (!propMap) {
    return;
  }

  const keys = [key];

  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    // 添加或者删除时, 触发的key为ITERATE_KEY
    keys.push(ITERATE_KEY);
  }

  const effectFns = new Set<EffectFn>();

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
  } as const;

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

import { track, trigger, resumeTracking, pauseTracking } from "./effect";
import { hasChanged, isObject } from "./utils";
import { reactive } from "./reactive";
import { TrackOpTypes, TriggerOpTypes } from "./operations";

const RAW_OBJ_KEY = Symbol("RAW_OBJ_KEY");

/** 数组拦截 */
const arrayInstrumentations = {};

["includes", "indexOf", "lastIndexOf"].forEach((key) => {
  arrayInstrumentations[key] = function (...args) {
    const res = Array.prototype[key].apply(this, args);
    if (res === -1 || res === false) {
      // 找不到，从原始对象上面找
      return Array.prototype[key].apply(this[RAW_OBJ_KEY], args);
    }
    return res;
  };
});

["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
  arrayInstrumentations[key] = function (...args) {
    // 暂停收集依赖
    pauseTracking();
    const res = Array.prototype[key].apply(this, args);
    resumeTracking();
    return res;
  };
});

function get(target, key, receiver) {
  if (key === RAW_OBJ_KEY) {
    return target;
  }

  track(target, TrackOpTypes.GET, key); // 依赖收集

  if (arrayInstrumentations.hasOwnProperty(key) && Array.isArray(target)) {
    return arrayInstrumentations[key];
  }

  const result = Reflect.get(target, key, receiver);
  if (isObject(result)) {
    return reactive(result);
  }
  return result;
}

function set(target, key, value, receiver) {
  const type = Reflect.has(target, key)
    ? TriggerOpTypes.SET
    : TriggerOpTypes.ADD;
  const oldValue = target[key];
  const oldLen = Array.isArray(target) ? target.length : undefined;

  const result = Reflect.set(target, key, value, receiver);

  if (!result) {
    // 设置失败
    return result;
  }

  const newLen = Array.isArray(target) ? target.length : undefined;

  if (hasChanged(oldValue, value) || type === TriggerOpTypes.ADD) {
    trigger(target, type, key); // 派发更新

    if (Array.isArray(target) && oldLen !== newLen) {
      // 通过隐式修改length 触发修改length 的监听
      if (key !== "length") {
        trigger(target, TriggerOpTypes.SET, "length");
      } else {
        for (let i = newLen!; i < oldLen!; i++) {
          // 数组长度变小触发Delete 操作
          trigger(target, TriggerOpTypes.DELETE, i.toString());
        }
      }
    }
  }
  return result;
}

function deleteProperty(target, key) {
  const hadKey = Reflect.has(target, key);
  const deleted = Reflect.deleteProperty(target, key);
  if (hadKey && deleted) {
    trigger(target, TriggerOpTypes.DELETE, key); // 派发更新
  }
  return deleted;
}

function ownKeys(target) {
  track(target, TrackOpTypes.ITERATE); // 依赖收集
  return Reflect.ownKeys(target);
}

function has(target, key) {
  const result = Reflect.has(target, key);
  track(target, TrackOpTypes.HAS, key); // 依赖收集
  return result;
}

export const handles = {
  get,
  set,
  /** in 操作时触发 */
  has,
  /** 删除属性时触发 */
  deleteProperty,
  /** 拦截for in 循环 */
  ownKeys,
};

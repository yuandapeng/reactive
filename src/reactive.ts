import { handles } from "./handles";
import { isObject } from "./utils";

const targetMap = new WeakMap();

export function reactive(target: any) {
  if (!isObject(target)) {
    console.warn("[reactive warn]: target must be an Object"); // 不是一个对象直接返回
    return;
  }

  if (targetMap.has(target)) {
    return targetMap.get(target);
  }

  const proxy = new Proxy(target, handles);

  targetMap.set(target, proxy);
  return proxy;
}

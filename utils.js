export function isObject(value) {
  return typeof value === "object" && value !== null;
}


export function hasChanged(value, oldValue) {
   // 排除 NAN +0 -0
  return !Object.is(value, oldValue);
}
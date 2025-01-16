export function isObject(value: any) {
  return typeof value === "object" && value !== null;
}

export function hasChanged(value: any, oldValue: any) {
  // 排除 NAN +0 -0
  return !Object.is(value, oldValue);
}

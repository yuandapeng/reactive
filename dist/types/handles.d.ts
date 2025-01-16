declare function get(target: any, key: any, receiver: any): any;
declare function set(target: any, key: any, value: any, receiver: any): boolean;
declare function deleteProperty(target: any, key: any): boolean;
declare function ownKeys(target: any): (string | symbol)[];
declare function has(target: any, key: any): boolean;
export declare const handles: {
    get: typeof get;
    set: typeof set;
    /** in 操作时触发 */
    has: typeof has;
    /** 删除属性时触发 */
    deleteProperty: typeof deleteProperty;
    /** 拦截for in 循环 */
    ownKeys: typeof ownKeys;
};
export {};

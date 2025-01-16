import { TrackOpTypes, TriggerOpTypes } from "./operations";
type GetEnumValues<T> = T[keyof T];
interface EffectFn {
    (): void;
    deps: Set<EffectFn>[];
}
export declare const effect: (fn: any) => void;
export declare function cleanup(effectFn: EffectFn): void;
export declare function pauseTracking(): void;
export declare function resumeTracking(): void;
export declare function track(target: object, type: GetEnumValues<typeof TrackOpTypes>, key?: string | symbol): void;
export declare function trigger(target: object, type: GetEnumValues<typeof TriggerOpTypes>, key: string | symbol): void;
export declare function getEffectFns(target: object, type: GetEnumValues<typeof TriggerOpTypes>, key: string | symbol): Set<EffectFn> | undefined;
export {};

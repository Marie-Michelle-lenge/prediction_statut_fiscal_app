export type UiComponentVariant = "none";
export type UiComponentIntent<V> = V extends "none" ? "none" : never;
export const resolveIntent = <V>(variant: V, intent: unknown) => intent;

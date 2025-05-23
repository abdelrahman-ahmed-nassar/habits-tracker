/**
 * Utility types for better TypeScript type safety
 */

/**
 * Makes specified properties of T required
 */
export type RequireProperties<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Makes specified properties of T optional
 */
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Extracts the keys of T whose values are assignable to U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Makes specified properties of T nullable
 */
export type NullableProperties<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

/**
 * Makes all properties of T nullable
 */
export type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Makes all properties of T non-nullable
 */
export type NonNullable<T> = { [P in keyof T]: NonNullable<T[P]> };

/**
 * Creates a type for a result that can either be successful with a value or an error with a message
 */
export type Result<T, E = string> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Creates a type for a function that returns a Promise of a Result
 */
export type AsyncResult<T, E = string> = Promise<Result<T, E>>;

/**
 * Creates a type for an asynchronous operation with loading state
 */
export interface AsyncOperation<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Creates a deep partial type that makes all properties and sub-properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Creates a type that requires at least one of the properties of T
 */
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * Creates a type that requires exactly one of the properties of T
 */
export type RequireExactlyOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & { [P in keyof Omit<T, K>]?: never };
}[keyof T];

/**
 * Creates a readonly version of T
 */
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

/**
 * Helper type for representing a valid ISO date string
 * Note: This is only for documentation, TypeScript can't actually validate the string format at compile time
 */
export type ISODateString = string;

/**
 * Helper type for representing a valid ISO datetime string
 * Note: This is only for documentation, TypeScript can't actually validate the string format at compile time
 */
export type ISODateTimeString = string;

/**
 * Helper type for representing a time string in HH:MM format
 * Note: This is only for documentation, TypeScript can't actually validate the string format at compile time
 */
export type TimeString = string;

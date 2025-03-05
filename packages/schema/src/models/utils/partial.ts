/**
 * a type with all properties of `T` made optional and also allowing `undefined`
 *
 * This is an extra lax version of the `Partial` utility type provided by
 * TypeScript. It allows Zod schemas, which treat `undefined` as being identical
 * to unset to work in projects that use `exactOptionalPropertyTypes`.
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype|Partial type}
 */
export type PartialWithUndefined<T> = {
  [K in keyof T]?: T[K] | undefined
}

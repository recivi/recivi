/**
 * Get the type with all properties allowing `undefined` as a value. It
 * does not make the properties optional!
 */
export type WithUndefinedValues<T> = {
  [K in keyof T]: T[K] | undefined
}

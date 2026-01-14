// export const stateReducer = (o: any, n: any) => ({ ...o, ...n })

export function stateReducer<T>(o: T, n: T) {
  return { ...o, ...n }
}

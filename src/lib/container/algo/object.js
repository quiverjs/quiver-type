export const objectKeys = function*(object) {
  yield* Object.getOwnPropertyNames(object)
  yield* Object.getOwnPropertySymbols(object)
}

export const objectEntries = function*(object) {
  for(let key of objectKeys(object)) {
    yield [key, object[key]]
  }
}

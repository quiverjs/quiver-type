import { IMap, IList } from './container'

export { assertFunction, assertString } from 'quiver-util/assert'

export const isInstanceOf = (object, type) => {
  return object instanceof type
}

export const assertInstanceOf = (object, type, message) => {
  if(!isInstanceOf(object, type)) {
    const errMessage = message || `argument must be instance of ${type.name}`
    throw new TypeError(errMessage)
  }
}

export const assertList = (list, message) => {
  if(!IList.isList(list)) {
    const errMessage = message || 'argument must be ImmutableList'
    throw new TypeError(errMessage)
  }
}

export const assertListContent = (list, ElementType, message) => {
  assertList(list)

  for(const element of list) {
    assertInstanceOf(element, ElementType, message)
  }
}

export const assertMap = (map, message) => {
  if(!IMap.isMap(map)) {
    const errMessage = message || 'argument must be ImmutableMap'
    throw new TypeError(errMessage)
  }
}

export const assertNoError = err => {
  if(err) throw err
}

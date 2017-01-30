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

export const assertKeyword = keyword => {
  const keyType = typeof(keyword)
  if(keyType !== 'string' && keyType !== 'symbol') {
    throw new TypeError('keyword must be either string or symbol')
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

export const assertArray = (array, message) => {
  if(!Array.isArray(array)) {
    const errMessage = message || 'argument must be an array'
    throw new TypeError(errMessage)
  }
}

export const assertArrayContent = (array, ElementType, message) => {
  assertArray(array)

  for(const element of array) {
    assertInstanceOf(element, ElementType, message)
  }
}

export const assertPairArray = (array, message) => {
  assertArray(array)

  for(const pair of array) {
    assertArray(pair)

    if(pair.length !== 2) {
      const errMessage = message || 'argument must be 2-element array pair'
      throw new TypeError(errMessage)
    }
  }
}

import immutable from 'immutable'

export { assertFunction } from 'quiver-util/assert'

export const assertType = (object, type, message) => {
  if(!(object instanceof type)) {
    const errMessage = message || `argument must be instance of ${type.name}`
    throw new TypeError(errMessage)
  }
}

export const assertList = (list, message) => {
  if(!immutable.List.isList(list)) {
    const errMessage = message || 'argument must be ImmutableList'
    throw new TypeError(errMessage)
  }
}

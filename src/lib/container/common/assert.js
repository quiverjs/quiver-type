export const isString = str => {
  return typeof(str) === 'string'
}

export const isKeyword = keyword => {
  const type = typeof(keyword)
  if(type === 'string' || type === 'symbol') {
    return true
  } else {
    return false
  }
}

export const assertString = str => {
  if(!isString(str))
    throw new TypeError('argument must be string')
}

export const assertKeyword = keyword => {
  if(!isKeyword(keyword))
    throw new TypeError('argument must be either string or symbol')
}

export const isInstanceOf = (object, Class) => {
  return (object instanceof Class)
}

export const assertInstanceOf = (object, Class) => {
  if(!isInstanceOf(object, Class))
    throw new TypeError(`argument must be instance of ${Class.name}`)
}

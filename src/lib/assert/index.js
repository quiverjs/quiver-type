
export const isNumber = num => {
  return typeof(num) === 'number'
}

export const isInteger = int => {
  return isNumber(int) && ((int|0) === int)
}

export const isNat = nat => {
  return isInteger(nat) && (nat > 0)
}

export const isString = str => {
  return typeof(str) === 'string'
}

export const isSymbol = symbol => {
  return typeof(symbol) === 'symbol'
}

export const isKeyword = keyword => {
  const type = typeof(keyword)
  return (type === 'string' || type === 'symbol')
}

export const isBoolean = bool => {
  return typeof(bool) === 'boolean'
}

export const isObject = object => {
  return typeof(object) === 'object'
}

export const isArray = array => {
  return Array.isArray(array)
}

export const isInstanceOf = (object, Class) => {
  return (object instanceof Class)
}

export const assertString = str => {
  if(!isString(str))
    throw new TypeError('argument must be string')
}

export const assertKey = assertString

export const assertKeyword = keyword => {
  if(!isKeyword(keyword))
    throw new TypeError('argument must be either string or symbol')
}

export const assertNat = nat => {
  if(!isNat(nat))
    throw new TypeError('argument must be natural number')
}

export const assertInstanceOf = (object, Class) => {
  if(!isInstanceOf(object, Class))
    throw new TypeError(`argument must be instance of ${Class.name}`)
}

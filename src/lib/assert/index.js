export const isString = str => {
  return typeof(str) === 'string'
}

export const isNat = nat => {
  return (typeof(nat) === 'number') &&
    (nat > 0) && ((nat|0) === nat)
}

export const isKeyword = keyword => {
  const type = typeof(keyword)
  return (type === 'string' || type === 'symbol')
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

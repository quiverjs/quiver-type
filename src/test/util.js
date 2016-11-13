import { LiteralType } from '../lib/type'

export const assertNumber = num => {
  if(typeof(num) !== 'number')
    return new TypeError('argument must be number')
}

export const assertString = str => {
  if(typeof(str) !== 'string')
    return new TypeError('argument must be string')
}

export const equals = function(result, expected, message) {
  return this.ok(result.equals(expected), message)
}

export const termTypeEquals = function(term, expectedType, message) {
  const err = expectedType.typeCheck(term.termType())
  this.notOk(err, message)
}

export const typeKindEquals = function(type, expectedKind, message) {
  const err = expectedKind.kindCheck(type.typeKind())
  this.notOk(err, message)
}

export const NumberType = new LiteralType('Number', assertNumber)
export const StringType = new LiteralType('String', assertString)

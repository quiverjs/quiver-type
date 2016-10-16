import { LiteralType } from 'lib/type'

export const assertNumber = num => {
  if(typeof(num) !== 'number')
    throw new TypeError('argument must be number')
}

export const assertString = str => {
  if(typeof(str) !== 'string')
    throw new TypeError('argument must be string')
}

export const equals = function(result, expected, message) {
  return this.ok(result.equals(expected), message)
}

export const equalsType = function(result, expectedType) {
  expectedType.typeCheck(result.exprType())
}

export const NumberType = new LiteralType(assertNumber)
export const StringType = new LiteralType(assertString)

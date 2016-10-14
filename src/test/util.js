import { emptyEnv } from '../lib/core/env'

import { LiteralType } from '../lib/type'

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
  expectedType.typeCheck(result.exprType(emptyEnv))
}

export const NumberType = new LiteralType(assertNumber)
export const StringType = new LiteralType(assertString)

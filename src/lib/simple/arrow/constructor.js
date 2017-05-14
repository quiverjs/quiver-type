import { FunctionValue } from './function'
import { arrow, isArrowType } from '../type/arrow'
import { assertFunction } from '../../assert'
import {
  currifyFunction, nestedCurrifyFunction
} from './curry'

const wrapSafeReturn = (returnType, func) =>
  (...args) => {
    const result = func(...args)

    const err = returnType.checkValue(result)
    if(err)
      throw new TypeError(`return value from function does not match type: ${err}`)

    return result
  }

export const simpleArrowFunction = (argTypes, returnType, func) => {
  assertFunction(func)

  if(isArrowType(returnType))
    throw new TypeError('return type must not be arrow type')

  const arrowType = arrow(...argTypes, returnType)
  const { arity } = arrowType

  const wrappedFunc = wrapSafeReturn(returnType, func)
  const curriedFunc = currifyFunction(wrappedFunc, arity)

  return new FunctionValue(arrowType, curriedFunc)
}

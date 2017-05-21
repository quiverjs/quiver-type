import { arrow, assertArrowType } from '../type/arrow'
import { getReturnType } from './args'
import { currifyFunction } from './curry'
import { FunctionValue } from './function'
import { assertFunction } from '../../assert'

const wrapSafeReturn = (returnType, func) =>
  (...args) => {
    const result = func(...args)

    const err = returnType.checkValue(result)
    if(err)
      throw new TypeError(`return value from function does not match type: ${err}`)

    return result
  }

export const arrowFunction = (arrowType, func, arity=arrowType.arity) => {
  assertFunction(func)
  assertArrowType(arrowType)

  if(arity > arrowType.arity)
    throw new TypeError('arity must be <= arrowType.arity')

  const returnType = getReturnType(arrowType, arity)
  const wrappedFunc = wrapSafeReturn(returnType, func)
  const curriedFunc = currifyFunction(wrappedFunc, arity)

  return new FunctionValue(arrowType, arity, curriedFunc)
}

export const simpleArrowFunction = (argTypes, returnType, func) => {
  assertFunction(func)

  const arity = argTypes.length
  const arrowType = arrow(...argTypes, returnType)

  const wrappedFunc = wrapSafeReturn(returnType, func)
  const curriedFunc = currifyFunction(wrappedFunc, arity)

  return new FunctionValue(arrowType, arity, curriedFunc)
}

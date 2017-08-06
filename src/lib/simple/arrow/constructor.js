import { arrowType, assertArrowType } from '../type/arrow'
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

export const arrowFunction = (funcType, func, arity=funcType.arity) => {
  assertFunction(func)
  assertArrowType(funcType)

  if(arity > funcType.arity)
    throw new TypeError('arity must be <= funcType.arity')

  const returnType = getReturnType(funcType, arity)
  const wrappedFunc = wrapSafeReturn(returnType, func)
  const curriedFunc = currifyFunction(wrappedFunc, arity)

  return new FunctionValue(funcType, arity, curriedFunc)
}

export const simpleArrowFunction = (argTypes, returnType, func) => {
  assertFunction(func)

  const arity = argTypes.length
  const funcType = arrowType(...argTypes, returnType)

  const wrappedFunc = wrapSafeReturn(returnType, func)
  const curriedFunc = currifyFunction(wrappedFunc, arity)

  return new FunctionValue(funcType, arity, curriedFunc)
}

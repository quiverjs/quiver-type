import { arrow } from '../type/arrow'
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

export const simpleArrowFunction = (argTypes, returnType, func) => {
  assertFunction(func)

  const arity = argTypes.length
  const arrowType = arrow(...argTypes, returnType)

  const wrappedFunc = wrapSafeReturn(returnType, func)
  const curriedFunc = currifyFunction(wrappedFunc, arity)

  return new FunctionValue(arrowType, arity, curriedFunc)
}

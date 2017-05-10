import { ArrowValue } from './arrow'
import { checkArgs, checkPartialArgs, getArgsReturn } from '../util/args'
import { curriedApply, assertFunctionReturned } from '../util/curry'

const $arrowType = Symbol('@arrowType')
const $curriedFunc = Symbol('@curriedFunc')

const applyArgs = (curriedFunc, returnType, args) => {
  const returnValue = curriedApply(curriedFunc, args)

  if(!returnType.isArrowType)
    return returnValue

  assertFunctionReturned(returnValue)
  return new FunctionValue(returnType, returnValue)
}

export class FunctionValue extends ArrowValue {
  // constructor :: This -> ArrowType -> CurriedFunction -> ()
  constructor(arrowType, curriedFunc) {
    super()

    this[$arrowType] = arrowType
    this[$curriedFunc] = curriedFunc
  }

  apply(...args) {
    const { curriedFunc, arrowType } = this
    const returnType = checkArgs(arrowType, args)
    return applyArgs(curriedFunc, returnType, args)
  }

  applyPartial(...args) {
    const { curriedFunc, arrowType } = this
    const returnType = checkPartialArgs(arrowType, args)
    return applyArgs(curriedFunc, returnType, args)
  }

  applyRaw(...args) {
    const { curriedFunc, arrowType } = this
    const returnType = getArgsReturn(arrowType, args)
    return applyArgs(curriedFunc, returnType, args)
  }
}

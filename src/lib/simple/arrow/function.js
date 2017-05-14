import { ArrowValue } from './arrow'
import { assertFunction } from '../../assert'
import { assertArrowType, isArrowType } from '../type/arrow'
import { curriedApply, assertFunctionReturned } from './curry'
import { checkArgs, checkPartialArgs, getArgsReturn } from './args'

const $arrowType = Symbol('@arrowType')
const $curriedFunc = Symbol('@curriedFunc')

const applyArgs = (curriedFunc, returnType, args) => {
  const returnValue = curriedApply(curriedFunc, args)

  if(!isArrowType(returnType))
    return returnValue

  assertFunctionReturned(returnValue)
  return new FunctionValue(returnType, returnValue)
}

export class FunctionValue extends ArrowValue {
  // constructor :: This -> ArrowType -> CurriedFunction -> ()
  constructor(arrowType, curriedFunc) {
    assertArrowType(arrowType)
    assertFunction(curriedFunc)

    super()

    this[$arrowType] = arrowType
    this[$curriedFunc] = curriedFunc
  }

  get arrowType() {
    return this[$arrowType]
  }

  get curriedFunc() {
    return this[$curriedFunc]
  }

  apply(...args) {
    const { curriedFunc, arrowType } = this
    const returnType = checkArgs(arrowType, args)
    return applyArgs(curriedFunc, returnType, args)
  }

  applyPartial(...args) {
    if(args.length === 0)
      return this

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

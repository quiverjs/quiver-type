import { ArrowValue } from './arrow'
import { getReturnType } from './args'
import { assertArrowType } from '../type/arrow'
import { sliceNode, assertNode } from '../../container'
import { assertFunction, assertNat } from '../../assert'
import { curriedApply, assertFunctionReturned } from './curry'

const $arity = Symbol('@arity')
const $arrowType = Symbol('@arrowType')
const $curriedFunc = Symbol('@curriedFunc')

export class FunctionValue extends ArrowValue {
  // constructor :: This -> ArrowType -> Nat -> CurriedFunction -> ()
  constructor(arrowType, arity, curriedFunc) {
    assertArrowType(arrowType)
    assertNat(arity)
    assertFunction(curriedFunc)

    if(arity > arrowType.arity)
      throw new Error('arity must be lower or equal than arrow type arity')

    super()

    this[$arrowType] = arrowType
    this[$arity] = arity
    this[$curriedFunc] = curriedFunc
  }

  get arrowType() {
    return this[$arrowType]
  }

  get arity() {
    return this[$arity]
  }

  get curriedFunc() {
    return this[$curriedFunc]
  }

  $apply(args) {
    assertNode(args)

    const argsSize = args.size

    if(argsSize === 0)
      return this

    const { curriedFunc, arrowType, arity } = this

    if(argsSize > arrowType.arity)
      throw new Error('too many arguments provided')

    if(argsSize === arity)
      return curriedApply(curriedFunc, args)

    if(argsSize < arity) {
      const restType = getReturnType(arrowType, argsSize)
      const restArity = arity - argsSize

      const restFunc = curriedApply(curriedFunc, args)
      assertFunctionReturned(restFunc)

      return new FunctionValue(restType, restArity, restFunc)
    }

    const [currentArgs, restArgs] = sliceNode(args, arity)

    const resultArrow = curriedApply(curriedFunc, currentArgs)
    return resultArrow.$apply(restArgs)
  }
}

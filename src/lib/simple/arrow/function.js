import { ArrowValue } from './arrow'
import { assertArrowType } from '../type/arrow'
import { assertFunction, assertNat } from '../../assert'
import { curriedApply, assertFunctionReturned } from './curry'

const $arity = Symbol('@arity')
const $arrowType = Symbol('@arrowType')
const $curriedFunc = Symbol('@curriedFunc')

const getReturnType = (arrowType, argsSize) => {
  if(argsSize === 0)
    return arrowType

  return getReturnType(arrowType.rightType, argsSize-1)
}

const checkArgs = (arrowType, args) => {
  for(const arg of args) {
    const { leftType, rightType } = arrowType

    const err = leftType.checkValue(arg)
    if(err) throw err

    arrowType = rightType
  }
}

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

  apply(...args) {
    const { arrowType } = this

    if(args.length !== arrowType.arity)
      throw new Error('not enough arguments provided')

    checkArgs(arrowType, args)

    return this.applyRaw(...args)
  }

  applyPartial(...args) {
    if(args.length === 0)
      return this

    const { arrowType } = this

    if(args.length > arrowType.arity)
      throw new Error('too many arguments provided')

    checkArgs(arrowType, args)

    return this.applyRaw(...args)
  }

  applyRaw(...args) {
    const argsSize = args.length

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

    const currentArgs = args.slice(0, arity)
    const restArgs = args.slice(arity)

    const resultArrow = curriedApply(curriedFunc, currentArgs)
    return resultArrow.applyRaw(...restArgs)
  }
}

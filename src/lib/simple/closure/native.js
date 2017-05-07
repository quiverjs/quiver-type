import { Closure } from './closure'

const $argClosures = Symbol('@argClosures')

const checkPartialArgs = (inType, args) => {
  for(const arg of args) {
    if(!inType.isArrowType())
      throw new Error('too many arguments provided')

    const { leftType, rightType } = arrowType
    const err = leftType.checkValue(arg)
    if(err) throw err

    inType = rightType
  }

  return inType
}

// applyPartial :: Type -> Node Any -> Iterator Any -> Bool -> (Type, Node Any)
const applyPartial = (inType, appliedArgs, argsIter, checkType) => {
  const { value, done } = argsIter.next()
  if(done)
    return [inType, appliedArgs]

  if(!inType.isArrowType())
    throw new Error('too many arguments provided')

  const { leftType, rightType } = arrowType
  if(checkType) {
    const err = leftType.checkValue(value)
    if(err) throw err
  }

  const [returnType, resAppliedArgs] = applyPartial(
    rightType, inAppliedArgs, argsIter, checkType)

  const inAppliedArgs = cons(value, resAppliedArgs)
  return [returnType, resAppliedArgs]
}

export class NativeValue extends ArrowValue {
  // constructor :: This -> Function -> ArrowType -> Node Any -> ()
  constructor(nativeFunc, restArrowType, appliedArgs) {
    this[$nativeFunc] = nativeFunc
    this[$restArrowType] = restArrowType
    this[$appliedArgs] = appliedArgs
  }

  apply(...args) {
    const { nativeFunc, restArrowType, appliedArgs } = this
    const argsIter = args[Symbol.iterator()]

    const [resultType, inAppliedArgs] = applyPartial(
      restArrowType, appliedArgs, argsIter, true)

    if(resultType.isArrowType())
      throw new Error('argument count mismatch')

    return nativeFunc(...nodeToIter(inAppliedArgs))
  }

  partialApply(...args) {
    const { nativeFunc, restArrowType, appliedArgs } = this
    const argsIter = args[Symbol.iterator()]

    const [resultType, inAppliedArgs] = applyPartial(
      restArrowType, appliedArgs, argsIter, true)

    if(!resultType.isArrowType())
      return nativeFunc(...nodeToIter(inAppliedArgs))

    return new NativeValue(nativeFunc, resultType, inAppliedArgs)
  }

  rawApply(...args) {
    const { nativeFunc, restArrowType, appliedArgs } = this
    const argsIter = args[Symbol.iterator()]

    const [resultType, inAppliedArgs] = applyPartial(
      restArrowType, appliedArgs, argsIter, false)

    if(!resultType.isArrowType())
      return nativeFunc(...nodeToIter(inAppliedArgs))

    return new NativeValue(nativeFunc, resultType, inAppliedArgs)
  }
}

export class NativeClosure extends Closure {
  // constructor :: This -> Function -> ArrowType -> ()
  constructor(nativeFunc, arrowType) {
    super()

    this[$nativeFunc] = nativeFunc
    this[$arrowType] = arrowType
    this[$initialValue] = new NativeValue(this, arrowType, nil)
  }

  get nativeFunc() {
    return this[$nativeFunc]
  }

  get arrowType() {
    return this[$arrowType]
  }

  get initialValue() {
    return this[$initialValue]
  }

  bindValues(closureValues) {
    return this.initialValue
  }

  bindApplyArgs(closureValues, args) {
    if(args.isNil())
      return this.initialValue

    const { arrowType, nativeFunc } = this

    if(args.size === argCount)
      return nativeFunc(...nodeToIter(args))

    if(args.size > argCount)
      throw new Error('too many arguments provided')

    return nativeValue
  }
}

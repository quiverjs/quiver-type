import { typeImpl } from './impl'
import { Type, assertType } from './type'
import { ArrowValue } from '../value/arrow'
import { cons, nodeFromValue } from '../container'
import { assertInstanceOf, isInstanceOf } from '../common/assert'

const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')
const $argTypes = Symbol('@argTypes')
const $returnType = Symbol('@returnType')
const $arity = Symbol('@arity')

const getArgTypes = (leftType, rightType) => {
  if(rightType.isArrowType()) {
    const { argTypes, returnType } = rightType
    return [cons(leftType, argTypes), returnType]

  } else {
    return [nodeFromValue(leftType), rightType]
  }
}

export const ArrowType = typeImpl(
  class extends Type {
    constructor(leftType, rightType) {
      assertType(leftType)
      assertType(rightType)

      const [argTypes, returnType] = getArgTypes(leftType, rightType)
      super()

      this[$leftType] = leftType
      this[$rightType] = rightType
      this[$argTypes] = argTypes
      this[$returnType] = returnType
      this[$arity] = argTypes.size
    }

    get leftType() {
      return this[$leftType]
    }

    get rightType() {
      return this[$rightType]
    }

    // argTypes :: () -> Node Type
    get argTypes() {
      return this[$argTypes]
    }

    get returnType() {
      return this[$returnType]
    }

    get arity() {
      return this[$arity]
    }

    checkType(targetType) {
      if(!isInstanceOf(targetType, ArrowType))
        return new TypeError('target type must be arrow type')

      const { leftType, rightType } = this

      const err = leftType.checkType(targetType.leftType)
      if(err) return err

      return rightType.typeCheck(targetType.rightType)
    }

    checkValue(arrowValue) {
      if(!isInstanceOf(arrowValue, ArrowValue))
        return new TypeError('argument must be instance of ArrowValue')

      const err = this.checkType(arrowValue.type)
      if(err) return err

      return null
    }

    isArrowType() {
      return true
    }

    checkArg(arg) {
      const { leftType } = this
      return leftType.checkValue(arg)
    }

    // checkArgs :: This -> Node -> Maybe Error
    checkArgs(args) {
      const { argTypes } = this
      if(argTypes.size !== args.size)
        return new Error('argument count mismatch')

      return this.checkPartialArgs(args)
    }

    // checkPartialArgs :: This -> Node -> Maybe Error
    checkPartialArgs(args) {
      if(args.isNil())
        return null

      const { item, next } = args
      const { leftType, rightType } = this

      const err = leftType.checkValue(item)
      if(err) return err

      if(isInstanceOf(rightType, ArrowType))
        return rightType.checkArgs(next)

      if(!next.isNil())
        return new TypeError('too many arguments provided')

      return null
    }
  })

  export const assertArrowType = arrowType =>
    assertInstanceOf(arrowType, ArrowType)

  export const isArrowType = arrowType =>
    isInstanceOf(arrowType, ArrowType)

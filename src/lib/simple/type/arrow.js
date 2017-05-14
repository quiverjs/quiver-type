import { typeImpl } from './impl'
import { Type, assertType } from './type'
import { ArrowValue } from '../value/arrow'
import { assertInstanceOf, isInstanceOf } from '../../assert'

const $arity = Symbol('@arity')
const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')

export const ArrowType = typeImpl(
  class extends Type {
    constructor(leftType, rightType) {
      assertType(leftType)
      assertType(rightType)

      super()

      this[$arity] = rightType.arity + 1
      this[$leftType] = leftType
      this[$rightType] = rightType
    }

    get arity() {
      return this[$arity]
    }

    get leftType() {
      return this[$leftType]
    }

    get rightType() {
      return this[$rightType]
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

    formatType() {
      const { leftType, rightType } = this
      const leftFormat = leftType.formatType()
      const rightFormat = rightType.formatType()

      return ['arrow-type', leftFormat, rightFormat]
    }
  })

export const assertArrowType = arrowType =>
  assertInstanceOf(arrowType, ArrowType)

export const isArrowType = arrowType =>
  isInstanceOf(arrowType, ArrowType)

export const arrow = (...argTypes) => {
  if(argTypes.length < 2) {
    throw new TypeError('arrow type must have at least 2 arg types')
  }

  const rightType = argTypes[argTypes.length-1]
  const restTypes = argTypes.slice(0, -1)

  return restTypes.reduceRight(
    (rightType, leftType) => {
      return new ArrowType(leftType, rightType)
    }, rightType)
}

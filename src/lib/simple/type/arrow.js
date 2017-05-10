import { typeImpl } from './impl'
import { Type, assertType } from './type'
import { ArrowValue } from '../value/arrow'
import { assertInstanceOf, isInstanceOf } from '../common/assert'

const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')

export const ArrowType = typeImpl(
  class extends Type {
    constructor(leftType, rightType) {
      assertType(leftType)
      assertType(rightType)

      super()

      this[$leftType] = leftType
      this[$rightType] = rightType
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

    get isArrowType() {
      return true
    }
  })

  export const assertArrowType = arrowType =>
    assertInstanceOf(arrowType, ArrowType)

  export const isArrowType = arrowType =>
    isInstanceOf(arrowType, ArrowType)

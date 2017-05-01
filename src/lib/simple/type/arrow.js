import { typeImpl } from './impl'
import { Type, assertType } from './type'
import { ArrowFunction } from './arrow-func'
import { listFromValue } from '../common/container'
import { assertInstanceOf, isInstanceOf } from '../common/assert'

const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')
const $argTypes = Symbol('@argTypes')
const $returnType = Symbol('@returnType')

export const ArrowType = typeImpl(
  class extends Type {
    constructor(leftType, rightType) {
      assertType(leftType)
      assertType(rightType)

      super()

      this[$leftType] = leftType
      this[$rightType] = rightType

      if(isInstanceOf(rightType, ArrowType)) {
        const { argTypes, returnType } = rightType
        this[$argTypes] = argTypes.prepend(leftType)
        this[$returnType] = returnType

      } else {
        this[$argTypes] = listFromValue(leftType)
        this[$returnType] = rightType
      }
    }

    get leftType() {
      return this[$leftType]
    }

    get rightType() {
      return this[$rightType]
    }

    get argTypes() {
      return this[$argTypes]
    }

    get returnType() {
      return this[$returnType]
    }

    checkType(targetType) {
      if(!isInstanceOf(targetType, ArrowType))
        return new TypeError('target type must be arrow type')

      const { leftType, rightType } = this

      const err = leftType.checkType(targetType.leftType)
      if(err) return err

      return rightType.typeCheck(targetType.rightType)
    }

    checkValue(func) {
      if(!isInstanceOf(func, ArrowFunction))
        return new TypeError('argument must be instance of ArrowFunction')

      const err = this.checkType(func.type)
      if(err) return err

      return null
    }

    checkArgs(arg, ...restArgs) {
      const { leftType, rightType } = this
      const err = leftType.checkValue(arg)
      if(err) return err

      if(isInstanceOf(rightType, ArrowType))
        return rightType.checkArgs(...restArgs)

      return null
    }
  })

  export const assertArrowType = arrowType =>
    assertInstanceOf(arrowType, ArrowType)

  export const isArrowType = arrowType =>
    isInstanceOf(arrowType, ArrowType)

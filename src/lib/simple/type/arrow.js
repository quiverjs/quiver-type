import { Type, assertType } from './type'
import { isArrowValue } from '../arrow'
import { assertInstanceOf, isInstanceOf } from '../../assert'

const $arity = Symbol('@arity')
const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')

export class ArrowType extends Type {
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
    assertType(targetType)

    if(!isInstanceOf(targetType, ArrowType))
      return new TypeError('target type must be arrow type')

    const { leftType, rightType } = this

    const err = leftType.checkType(targetType.leftType)
    if(err) return err

    return rightType.checkType(targetType.rightType)
  }

  checkValue(arrowValue) {
    if(!isArrowValue(arrowValue))
      return new TypeError('argument must be instance of ArrowValue')

    return this.checkType(arrowValue.arrowType)
  }

  formatType() {
    const { leftType, rightType } = this
    const leftFormat = leftType.formatType()
    const rightFormat = rightType.formatType()

    return ['arrow-type', leftFormat, rightFormat]
  }
}

export const assertArrowType = arrowType =>
  assertInstanceOf(arrowType, ArrowType)

export const isArrowType = arrowType =>
  isInstanceOf(arrowType, ArrowType)

export const arrowType = (...argTypes) => {
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

import { unitKind } from '../kind/unit'
import { CompiledArrowType } from '../compiled/arrow'
import {
  assertFunction,
  assertInstanceOf
} from '../core/assert'

import { Type } from './type'

const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')

export class ArrowType extends Type {
  // constructor :: Type -> Type -> ()
  constructor(leftType, rightType) {
    assertInstanceOf(leftType, Type)
    assertInstanceOf(rightType, Type)

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

  freeTypeVariables() {
    return this.leftType.freeTypeVariables()
      .union(this.rightType.freeTypeVariables())
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(targetType === this) return null

    if(!(targetType instanceof ArrowType))
      return new TypeError('target type must be ArrowType')

    const { leftType, rightType } = this

    const err = leftType.typeCheck(targetType.leftType)
    if(err) return err

    return rightType.typeCheck(targetType.rightType)
  }

  *subTypes() {
    const { leftType, rightType } = this

    yield leftType
    yield rightType
  }

  map(typeMapper) {
    assertFunction(typeMapper)

    const { leftType, rightType } = this

    const newLeftType = typeMapper(leftType)
    const newRightType = typeMapper(rightType)

    if((newLeftType === leftType) && (newRightType === rightType)) {
      return this
    } else {
      return new ArrowType(newLeftType, newRightType)
    }
  }

  typeKind() {
    return unitKind
  }

  compileType() {
    return new CompiledArrowType(this)
  }

  formatType() {
    const { leftType, rightType } = this

    const leftRep = leftType.formatType()
    const rightRep = rightType.formatType()

    return ['arrow-type', leftRep, rightRep]
  }
}

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

import { assertType } from '../core/assert'
import { TypeVariable } from '../core/variable'

import { typeKind } from '../kind/type'

import { Type } from './type'

const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')

export class ArrowType extends Type {
  // constructor :: Type -> Type -> ()
  constructor(leftType, rightType) {
    assertType(leftType, Type)
    assertType(rightType, Type)

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
    assertType(targetType, ArrowType)

    this.leftType.typeCheck(targetType.leftType)
    this.rightType.typeCheck(targetType.rightType)
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { leftType, rightType } = this

    const newLeftType = leftType.bindType(typeVar, type)
    const newRightType = rightType.bindType(typeVar, type)

    if((newLeftType === leftType) && (newRightType === rightType))
      return this

    return new ArrowType(newLeftType, newRightType)
  }

  typeKind(env) {
    return typeKind
  }

  isTerminal() {
    const { leftType, rightType } = this

    return leftType.isTerminal() && rightType.isTerminal()
  }
}

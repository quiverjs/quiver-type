import { assertType } from '../core/assert'
import { TypeVariable } from '../core/variable'

import { Kind } from '../kind/kind'
import { typeKind } from '../kind/type'
import { CompiledArrowType } from '../compiled/arrow'

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

    const { leftType, rightType } = this

    const err = leftType.typeCheck(targetType.leftType)
    if(err) return err

    return rightType.typeCheck(targetType.rightType)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { leftType, rightType } = this
    
    const err = leftType.validateTVarKind(typeVar, kind)
    if(err) return err

    return leftType.validateTVarKind(typeVar, kind)
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

  typeKind() {
    return typeKind
  }

  compileType() {
    return new CompiledArrowType(this)
  }

  isTerminal() {
    const { leftType, rightType } = this

    return leftType.isTerminal() && rightType.isTerminal()
  }
}

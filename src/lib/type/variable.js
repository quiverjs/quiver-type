import { Set } from '../core/container'
import { TypeVariable } from '../core/variable'
import { assertType, assertNoError } from '../core/assert'

import { Kind } from '../kind/kind'
import { ArrowKind } from '../kind/arrow'

import { Type } from './type'
import { ApplicationType } from './application'

const $typeVar = Symbol('@typeVar')
const $kind = Symbol('@kind')

export class VariableType extends Type {
  constructor(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    super()

    this[$typeVar] = typeVar
    this[$kind] = kind
  }

  get typeVar() {
    return this[$typeVar]
  }

  get kind() {
    return this[$kind]
  }

  freeTypeVariables() {
    return Set([this.typeVar])
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    if(typeVar !== this.typeVar)
      return this

    assertNoError(this[$kind].kindCheck(type.typeKind()))

    return type
  }

  typeCheck(targetType) {
    assertType(targetType, Type)

    if(!(targetType instanceof VariableType))
      return new TypeError('target type must be VariableType')

    // Without unification, only same type variable matches
    if(targetType.typeVar !== this.typeVar)
      return new TypeError('target type variable does not match')
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    if(this.typeVar !== typeVar)
      return null

    return this.kind.kindCheck(kind)
  }

  typeKind() {
    return this[$kind]
  }

  compileType() {
    throw new Error('Variable Type cannot be compiled')
  }

  applyType(targetType) {
    const selfKind = this.kind

    if(!(selfKind instanceof ArrowKind))
      throw new TypeError('type of non-arrow kind cannot be applied to other type')

    assertNoError(selfKind.leftKind.kindCheck(targetType.typeKind()))

    return new ApplicationType(this, targetType)
  }

  formatType() {
    const { typeVar } = this
    const typeVarRep = typeVar.name

    return ['tvar', typeVarRep]
  }
}

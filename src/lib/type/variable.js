import { Kind } from '../kind/kind'
import { assertType } from '../core/assert'
import { TypeVariable } from '../core/variable'

import { Type } from './type'

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

  freeTypeVariables() {
    return Set([this.typeVar])
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    if(typeVar !== this.typeVar)
      return this

    this[$kind].kindCheck(type.typeKind())

    return type
  }

  typeCheck(targetType) {
    assertType(targetType, Type)

    if(!(targetType instanceof VariableType))
      throw new TypeError('target type must be VariableType')

    // Without unification, only same type variable matches
    if(targetType.typeVar !== this.typeVar)
      throw new TypeError('target type variable does not match')
  }

  typeKind() {
    return this[$kind]
  }

  compileType() {
    throw new Error('Variable Type cannot be compiled')
  }

  isTerminal() {
    return false
  }
}

import { TypeVariable } from '../core/variable'
import { assertType } from '../core/assert'

import { Type } from './type'

const $typeVar = Symbol('@typeVar')

export class VariableType extends Type {
  constructor(typeVar) {
    assertType(typeVar, TypeVariable,
      'typeVar must be TypeVariable')

    super()

    this[$typeVar] = typeVar
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

    if(typeVar === this.typeVar)
      return type

    return this
  }

  typeCheck(targetType) {
    assertType(targetType, Type)

    if(!(targetType instanceof VariableType))
      throw new TypeError('target type must be VariableType')

    // Without unification, only same type variable matches
    if(targetType.typeVar !== this.typeVar)
      throw new TypeError('target type variable does not match')
  }

  typeKind(env) {
    const kind = env.get(this.typeVar)

    if(!kind)
      throw new Error('kind of type variable is not bound in kindEnv')
  }

  isTerminal() {
    return false
  }
}

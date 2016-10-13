import { assertType } from '../core/assert'
import { TypeVariable } from '../core/variable'

import { typeKind } from '../kind/type'
import { ArrowKind } from '../kind/arrow'

import { Type } from './type'
import { VariableType } from './variable'

const $typeVar = Symbol('@typeVar')
const $bodyType = Symbol('@type')

export class ForAllType extends Type {
  constructor(typeVar, bodyType) {
    assertType(typeVar, TypeVariable)
    assertType(bodyType, Type)

    super()

    this[$typeVar] = typeVar
    this[$bodyType] = bodyType
  }

  get typeVar() {
    return this[$typeVar]
  }

  get bodyType() {
    return this[$bodyType]
  }

  typeCheck(targetType) {
    assertType(targetType, ForAllType)

    const { typeVar, bodyType } = this

    // typeChecking forall: two forall types
    // (forall a. t1) and (forall b. t2) are equal
    // if t1 is the same as ([b->a] t2)

    const innerType = targetType.applyType(
      new VariableType(typeVar))

    bodyType.typeCheck(innerType)
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    if(typeVar === this.typeVar)
      return this

    const { bodyType } = this

    const newBodyType = bodyType.bindType(typeVar, type)

    if(newBodyType === bodyType)
      return this

    return new ForAllType(this.typeVar, newBodyType)
  }

  typeKind(env) {
    const { bodyType } = this

    return new ArrowKind(typeKind, bodyType.typeKind(env))
  }

  compileType() {
    throw new Error('ForAll Type cannot be compiled')
  }

  isTerminal() {
    return true
  }

  // applyType :: Type -> Type
  applyType(targetType) {
    assertType(targetType, Type)

    const { typeVar, type } = this

    return type.bindType(typeVar, targetType)
  }
}

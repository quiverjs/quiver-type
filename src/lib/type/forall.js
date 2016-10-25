import { assertType, assertNoError } from '../core/assert'
import { TypeVariable } from '../core/variable'

import { Kind } from '../kind/kind'
import { typeKind } from '../kind/type'
import { ArrowKind } from '../kind/arrow'

import { Type } from './type'
import { VariableType } from './variable'

const $argTVar = Symbol('@argTVar')
const $argKind = Symbol('@argKind')
const $bodyType = Symbol('@bodyType')
const $kind = Symbol('@kind')

export class ForAllType extends Type {
  constructor(argTVar, argKind, bodyType) {
    assertType(argTVar, TypeVariable)
    assertType(argKind, Kind)
    assertType(bodyType, Type)

    assertNoError(bodyType.validateTVarKind(argTVar, argKind))

    const kind = new ArrowKind(typeKind, bodyType.typeKind())

    super()

    this[$argTVar] = argTVar
    this[$argKind] = argKind
    this[$bodyType] = bodyType
    this[$kind] = kind
  }

  get argTVar() {
    return this[$argTVar]
  }

  get argKind() {
    return this[$argKind]
  }

  get bodyType() {
    return this[$bodyType]
  }

  typeCheck(targetType) {
    assertType(targetType, Type)

    if(!(targetType instanceof ForAllType))
      return new Error('target type must be ForAllType')

    const { argTVar, argKind, bodyType } = this

    // typeChecking forall: two forall types
    // (forall a. t1) and (forall b. t2) are equal
    // if t1 is the same as ([b->a] t2)

    const innerType = targetType.applyType(
      new VariableType(argTVar, argKind))

    return bodyType.typeCheck(innerType)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { argTVar, argKind, bodyType } = this

    if(argTVar === typeVar)
      return null

    return bodyType.validateTVarKind(typeVar, kind)
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { argTVar, argKind, bodyType } = this

    if(typeVar === argTVar)
      return this

    const newBodyType = bodyType.bindType(typeVar, type)

    if(newBodyType === bodyType)
      return this

    return new ForAllType(argTVar, argKind, newBodyType)
  }

  typeKind() {
    return this[$kind]
  }

  compileType() {
    throw new Error('ForAllType cannot be compiled')
  }

  isTerminal() {
    return true
  }

  // applyType :: Type -> Type
  applyType(targetType) {
    assertType(targetType, Type)

    const { argTVar, argKind, bodyType } = this

    assertNoError(argKind.kindCheck(targetType.typeKind()))

    return bodyType.bindType(argTVar, targetType)
  }

  formatType() {
    const { argTVar, argKind, bodyType } = this

    const argTVarRep = argTVar.name
    const argKindRep = argKind.formatType()
    const bodyTypeRep = bodyType.formatType()

    return ['for-all', [argTVarRep, argKindRep], bodyTypeRep]
  }
}

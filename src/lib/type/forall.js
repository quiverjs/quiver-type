import {
  assertNoError,
  assertKeyword,
  assertFunction,
  assertPairArray,
  assertInstanceOf
} from '../core/assert'

import { Kind } from '../kind/kind'
import { ArrowKind } from '../kind/arrow'

import { Type } from './type'
import { VariableType } from './variable'

const $argTVar = Symbol('@argTVar')
const $argKind = Symbol('@argKind')
const $bodyType = Symbol('@bodyType')
const $kind = Symbol('@kind')

export class ForAllType extends Type {
  constructor(argTVar, argKind, bodyType) {
    assertKeyword(argTVar)
    assertInstanceOf(argKind, Kind)
    assertInstanceOf(bodyType, Type)

    assertNoError(bodyType.validateTVarKind(argTVar, argKind))

    const kind = new ArrowKind(argKind, bodyType.typeKind())

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

  freeTypeVariables() {
    const { argTVar, bodyType } = this

    return bodyType.freeTypeVariables()
      .delete(argTVar)
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(targetType === this) return null

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

  *subTypes() {
    yield this.bodyType
  }

  validateTVarKind(typeVar, kind) {
    assertKeyword(typeVar)
    assertInstanceOf(kind, Kind)

    const { argTVar, bodyType } = this

    if(argTVar === typeVar)
      return null

    return bodyType.validateTVarKind(typeVar, kind)
  }

  map(typeMapper) {
    assertFunction(typeMapper)

    const { argTVar, argKind, bodyType } = this

    const newBodyType = typeMapper(bodyType)

    if(newBodyType === bodyType) {
      return this
    } else {
      return new ForAllType(argTVar, argKind, newBodyType)
    }
  }

  bindType(typeVar, type) {
    assertKeyword(typeVar)
    assertInstanceOf(type, Type)

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

  // applyType :: Type -> Type
  applyType(targetType) {
    assertInstanceOf(targetType, Type)

    const { argTVar, argKind, bodyType } = this

    assertNoError(argKind.kindCheck(targetType.typeKind()))

    return bodyType.bindType(argTVar, targetType)
  }

  formatType() {
    const { argTVar, argKind, bodyType } = this

    const argTVarRep = argTVar.name
    const argKindRep = argKind.formatKind()
    const bodyTypeRep = bodyType.formatType()

    return ['for-all', [argTVarRep, argKindRep], bodyTypeRep]
  }
}

export const forall = (bindings, bodyType) => {
  assertPairArray(bindings)

  return bindings.reduceRight(
    (bodyType, [argTVar, argKind]) => {
      return new ForAllType(argTVar, argKind, bodyType)
    },
    bodyType)
}

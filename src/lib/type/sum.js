import {
  assertType, assertMap,
  assertString, assertNoError
} from '../core/assert'

import { TypeVariable } from '../core/variable'

import { mapUnique } from '../core/util'

import { unionMap } from '../core/container'

import { Kind } from '../kind/kind'

import { unitKind } from '../kind/unit'

import { CompiledSumType } from '../compiled/sum'

import { Type } from './type'

const $typeMap = Symbol('@typeMap')

export class SumType extends Type {
  constructor(typeMap) {
    assertMap(typeMap)

    for(const [tag, type] of typeMap.entries()) {
      assertString(tag)
      assertType(type, Type)
      assertNoError(unitKind.kindCheck(type.typeKind()))
    }

    super()

    this[$typeMap] = typeMap
  }

  get typeMap() {
    return this[$typeMap]
  }

  freeTypeVariables() {
    return this.typeMap::unionMap(
      type => type.freeTypeVariables())
  }

  typeCheck(targetType) {
    assertType(targetType, Type)

    if(!(targetType instanceof SumType))
      return new TypeError('target type must be SumType')

    const { typeMap } = this
    const targetTypeMap = targetType.typeMap

    if(typeMap.size !== targetTypeMap.size)
      return new TypeError('target sum type contains different number of inner types')

    for(const [tag, inType] of typeMap.entries()) {
      const targetInType = targetTypeMap.get(tag)

      if(!targetInType)
        return new TypeError('target sum type contains different inner types')

      const err = inType.typeCheck(targetInType)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { typeMap } = this

    for(const inType of typeMap.values()) {
      const err = inType.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { typeMap } = this

    const [newTypeMap, modified] = typeMap::mapUnique(
      inType => inType.bindType(typeVar, type))

    if(!modified) return this

    return new SumType(newTypeMap)
  }

  typeKind() {
    return unitKind
  }

  compileType() {
    return new CompiledSumType(this)
  }

  formatType() {
    const { typeMap } = this

    const repMap = typeMap.map(
      type => type.formatType())

    return ['sum-type', [...repMap.entries()]]
  }
}

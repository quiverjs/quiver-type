import {
  assertMap,
  assertString,
  assertNoError,
  assertFunction,
  assertInstanceOf,
} from '../core/assert'

import { IMap } from '../core/container'

import { mapUnique } from '../core/util'

import { unionMap } from '../core/container'

import { unitKind } from '../kind/unit'

import { CompiledSumType } from '../compiled/sum'

import { Type } from './type'

const $typeMap = Symbol('@typeMap')

export class SumType extends Type {
  constructor(typeMap) {
    assertMap(typeMap)

    if(typeMap.size === 0)
      throw new TypeError('size of type map must be at least one')

    for(const [tag, type] of typeMap.entries()) {
      assertString(tag)
      assertInstanceOf(type, Type)
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
    assertInstanceOf(targetType, Type)

    if(targetType === this) return null

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

  *subTypes() {
    yield* this.typeMap.values()
  }

  map(typeMapper) {
    assertFunction(typeMapper)

    const { typeMap } = this

    const [newTypeMap, modified] = typeMap::mapUnique(typeMapper)

    if(modified) {
      return new SumType(newTypeMap)
    } else {
      return this
    }
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

export const sumType = (typeMap) => {
  return new SumType(IMap(typeMap))
}

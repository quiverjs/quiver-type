import { ISet } from '../core/container'
import { TypeVariable } from '../core/variable'
import { assertInstanceOf } from '../core/assert'

import { Kind } from '../kind/kind'
import { unitKind } from '../kind/unit'

import { CompiledUnitType } from '../compiled-type/unit'

import { Type } from './type'

export class UnitType extends Type {
  constructor() {
    super()
  }

  freeTypeVariables() {
    return ISet()
  }

  typeCheck(targetType) {
    if(targetType === this) return null

    if(targetType instanceof UnitType) {
      return null
    } else {
      return new TypeError('target type must be unit type')
    }
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    return null
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    return this
  }

  typeKind() {
    return unitKind
  }

  compileType() {
    return new CompiledUnitType(this)
  }

  formatType() {
    return ['unit-type']
  }
}

export const unitType = new UnitType()

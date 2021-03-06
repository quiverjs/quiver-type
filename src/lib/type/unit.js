import { ISet } from '../core/container'
import { assertFunction } from '../core/assert'

import { unitKind } from '../kind/unit'

import { CompiledUnitType } from '../compiled/unit'

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

  *subTypes() {
    // empty
  }

  map(typeMapper) {
    assertFunction(typeMapper)

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

import { typeImpl } from './impl'
import { Type } from './type'
import { isInstanceOf } from '../../assert'

export const UnitType = typeImpl(
  class extends Type {
    constructor() {
      super()
    }

    checkType(type) {
      if(!isInstanceOf(type, UnitType))
        return new TypeError('target type must be unit type')

      return null
    }

    checkValue(value) {
      if(value !== null)
        return new TypeError('null is the only unit value allowed')

      return null
    }

    formatType() {
      return ['unit-type']
    }
  })

export const unitType = new UnitType()

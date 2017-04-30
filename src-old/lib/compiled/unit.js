import { unitValue } from '../term/unit'
import { UnitType } from '../type/unit'
import { assertInstanceOf } from '../core/assert'

import { CompiledType } from './type'

export class CompiledUnitType extends CompiledType {
  constructor(srcType) {
    assertInstanceOf(srcType, UnitType)

    super(srcType)
  }

  typeCheck(object) {
    if(object === unitValue) {
      return null
    } else {
      return new TypeError('object must be unit value')
    }
  }
}

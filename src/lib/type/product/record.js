import {
  assertMap, assertString, assertInstanceOf
} from '../../core/assert'

import { Type } from '../../type/type'

import { BaseProductType } from './base'

export class RecordType extends BaseProductType {
  constructor(fieldTypes) {
    assertMap(fieldTypes)

    for(const [key, fieldType] of fieldTypes.entries()) {
      assertString(key)
      assertInstanceOf(fieldType, Type)
    }

    super(fieldTypes)
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(!(targetType instanceof RecordType))
      return new TypeError('target type must be record type')

    return super.typeCheck(targetType)
  }

  compileType() {
    throw new Error('not yet implemented')
  }

  formatType() {
    const { fieldTypes } = this

    const fieldReps = fieldTypes.map(
      fieldType => fieldType.formatType())

    return ['record-type', [...fieldReps.entries()]]
  }
}

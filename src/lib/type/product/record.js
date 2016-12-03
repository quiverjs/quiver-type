import {
  assertMap, assertString, assertInstanceOf
} from '../../core/assert'

import { Type } from '../../type/type'
import { CompiledRecordType } from '../../compiled-type/product'

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
    const { fieldTypes } = this

    const compiledFieldTypes = fieldTypes.map(
      fieldType => fieldType.compileType())

    return new CompiledRecordType(this, compiledFieldTypes)
  }

  formatType() {
    const { fieldTypes } = this

    const fieldReps = fieldTypes.map(
      fieldType => fieldType.formatType())

    return ['record-type', [...fieldReps.entries()]]
  }
}

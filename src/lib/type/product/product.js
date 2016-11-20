import {
  assertListContent, assertInstanceOf
} from '../../core/assert'

import { Type } from '../../type/type'

import { BaseProductType } from './base'

export class ProductType extends BaseProductType {
  constructor(fieldTypes) {
    assertListContent(fieldTypes, Type)

    super(fieldTypes)
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(!(targetType instanceof ProductType))
      return new TypeError('target type must be product type')

    return super.typeCheck(targetType)
  }

  compileType() {
    throw new Error('not yet implemented')
  }

  formatType() {
    const { fieldTypes } = this

    const fieldReps = fieldTypes.map(
      fieldType => fieldType.formatType())

    return ['product-type', [...fieldReps.values()]]
  }
}

import {
  assertListContent, assertInstanceOf
} from '../../core/assert'

import { IList } from '../../core/container'

import { Type } from '../../type/type'

import { CompiledProductType } from '../../compiled/product'

import { BaseProductType } from './base'

export class ProductType extends BaseProductType {
  constructor(fieldTypes) {
    assertListContent(fieldTypes, Type)

    if(fieldTypes.size === 0)
      throw new TypeError('size of field types must be at last one')

    super(fieldTypes)
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(!(targetType instanceof ProductType))
      return new TypeError('target type must be product type')

    return super.typeCheck(targetType)
  }

  compileType() {
    const { fieldTypes } = this

    const compiledFieldTypes = fieldTypes.map(
      fieldType => fieldType.compileType())

    return new CompiledProductType(this, compiledFieldTypes)
  }

  formatType() {
    const { fieldTypes } = this

    const fieldReps = fieldTypes.map(
      fieldType => fieldType.formatType())

    return ['product-type', [...fieldReps.values()]]
  }
}

export const productType = (...fieldTypes) => {
  return new ProductType(IList(fieldTypes))
}

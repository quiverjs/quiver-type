import { mapUnique } from '../../core/util'
import { unionMap } from '../../core/container'

import { assertFunction } from '../../core/assert'

import { Type } from '../../type/type'

import { unitKind } from '../../kind/unit'

const $fieldTypes = Symbol('@fieldTypes')

export class BaseProductType extends Type {
  constructor(fieldTypes) {
    super()

    if(this.constructor === BaseProductType)
      throw new Error('Abstract class BaseProductType cannot be instantiated')

    this[$fieldTypes] = fieldTypes
  }

  get fieldTypes() {
    return this[$fieldTypes]
  }

  freeTypeVariables() {
    const { fieldTypes } = this

    return fieldTypes::unionMap(
      fieldType => fieldType.freeTypeVariables())
  }

  typeCheck(targetType) {
    const { fieldTypes } = this
    const targetFieldTypes = targetType.fieldTypes

    if(fieldTypes.size !== targetFieldTypes.size) {
      return new TypeError('field types size mismatch')
    }

    for(const [fieldKey, fieldType] of fieldTypes.entries()) {
      const targetFieldType = targetFieldTypes.get(fieldKey)

      if(!targetFieldType)
        return new TypeError(`missing field ${fieldKey} in target type`)

      const err = fieldType.typeCheck(targetFieldType)
      if(err) return err
    }

    return null
  }

  *subTypes() {
    yield* this.fieldTypes.values()
  }

  map(typeMapper) {
    assertFunction(typeMapper)

    const { fieldTypes } = this

    const [newFieldTypes, isModified] = fieldTypes::mapUnique(typeMapper)

    if(isModified) {
      return new this.constructor(newFieldTypes)

    } else {
      return this
    }
  }

  typeKind() {
    return unitKind
  }
}

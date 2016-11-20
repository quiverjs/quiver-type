import { mapUnique } from '../../core/util'
import { unionMap } from '../../core/container'

import { Type } from '../../type/type'

import { unitKind } from '../../kind/unit'

const $fieldTypes = Symbol('@fieldTypes')

export class BaseProductType extends Type {
  constructor(fieldTypes) {
    super()

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
  }

  validateTVarKind(typeVar, kind) {
    const { fieldTypes } = this

    for(const fieldType of fieldTypes.values()) {
      const err = fieldType.validateTVarKind(typeVar, kind)
      if(err) return err
    }
  }

  bindType(typeVar, type) {
    const { fieldTypes } = this

    const [newFieldTypes, isModified] = fieldTypes::mapUnique(
      fieldType => fieldType.bindType(typeVar, type))

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

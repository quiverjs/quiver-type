import {
  assertMap, assertString, assertInstanceOf
} from '../core/assert'

import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'

import { Type } from '../type/type'

import { unitKind } from '../kind/kind'

const $fieldTypes = Symbol('@fieldTypes')

export class RecordType extends Type {
  constructor(fieldTypes) {
    assertMap(fieldTypes)

    for(const [key, fieldType] of fieldTypes.entries()) {
      assertString(key)
      assertInstanceOf(fieldType, Type)
    }

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
      return new RecordType(newFieldTypes)

    } else {
      return this
    }
  }

  typeKind() {
    return unitKind
  }

  compileType() {
    throw new Error('not yet implemented')
  }

  formatType() {
    const { fieldTypes } = this

    const fieldReps = fieldTypes.map(
      fieldType => fieldType.formatType())

    return ['record-type', [...fieldReps]]
  }
}

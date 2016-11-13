import { mapUnique } from '../../core/util'
import { unionMap } from '../../core/container'
import { TermVariable, TypeVariable } from '../../core/variable'

import { Type } from '../../type/type'
import { Kind } from '../../kind/kind'

import {
  assertMap, assertString, assertInstanceOf
} from '../../core/assert'

import { RecordType } from '../../type/record'

import { Term } from '../term'

const $recordType = Symbol('@recordType')
const $fieldTerms = Symbol('@fieldTerms')

export class RecordTerm extends Term {
  constructor(recordType, fieldTerms) {
    assertInstanceOf(recordType, RecordType)
    assertMap(fieldTerms)

    const { fieldTypes } = recordType

    if(fieldTypes.size !== fieldTerms.size)
      throw new TypeError('field terms size mismatch')

    for(const fieldKey of fieldTypes.keys()) {
      const fieldTerm = fieldTerms.get(fieldKey)
      if(!fieldTerm)
        throw new TypeError(`missing field ${fieldKey} in record term`)

      assertInstanceOf(fieldTerm, Term)
    }

    super()

    this[$recordType] = recordType
    this[$fieldTerms] = fieldTerms
  }

  get recordType() {
    return this[$recordType]
  }

  get fieldTerms() {
    return this[$fieldTerms]
  }

  getFieldTerm(fieldKey) {
    assertString(fieldKey)

    const fieldTerm = this.fieldTerms.get(fieldKey)
    if(!fieldTerm)
      throw new Error(`invalid field key ${fieldKey}`)

    return fieldTerm
  }

  freeTermVariables() {
    const { fieldTerms } = this

    return fieldTerms::unionMap(
      fieldTerm => fieldTerm.freeTermVariables())
  }

  termType() {
    return this.recordType
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { fieldTerms } = this

    for(const fieldTerm of fieldTerms.values()) {
      const err = fieldTerm.validateVarType(termVar, type)
      if(err) return err
    }
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { recordType, fieldTerms } = this

    for(const fieldTerm of fieldTerms.values()) {
      const err = fieldTerm.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return recordType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { recordType, fieldTerms } = this

    const [newFieldTerms, isModified] = fieldTerms::mapUnique(
      fieldTerm => fieldTerm.bindTerm(termVar, term))

    if(isModified) {
      return new RecordTerm(recordType, newFieldTerms)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { recordType, fieldTerms } = this

    const newRecordType = recordType.bindType(typeVar, type)

    const [newFieldTerms, isModified] = fieldTerms::mapUnique(
      fieldTerm => fieldTerm.bindType(typeVar, type))

    if(isModified || recordType !== newRecordType) {
      return new RecordTerm(newRecordType, newFieldTerms)

    } else {
      return this
    }
  }

  evaluate() {
    const { recordType, fieldTerms } = this

    const [newFieldTerms, isModified] = fieldTerms::mapUnique(
      fieldTerm => fieldTerm.evaluate())

    if(isModified) {
      return new RecordTerm(recordType, newFieldTerms)

    } else {
      return this
    }
  }

  compileBody() {
    throw new Error('not yet implemented')
  }

  formatTerm() {
    const { recordType, fieldTerms } = this

    const recordTypeRep = recordType.formatType()
    const fieldTermsRep = fieldTerms.mapEntries(
      ([fieldKey, fieldTerm]) =>
        [fieldKey, fieldTerm.formatTerm()])

    return ['record-term', recordTypeRep, [...fieldTermsRep]]
  }
}

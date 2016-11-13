import { TermVariable, TypeVariable } from '../../core/variable'

import { Type } from '../../type/type'

import {
  assertInstanceOf, assertString
} from '../../core/assert'

import { RecordType } from '../../type/record'

import { Term } from '../term'

import { RecordTerm } from './record'

const $recordTerm = Symbol('@recordTerm')
const $fieldKey = Symbol('@fieldKey')
const $fieldType = Symbol('@fieldType')

export class ProjectRecordTerm extends Term {
  constructor(recordTerm, fieldKey) {
    assertInstanceOf(recordTerm, Term)
    assertString(fieldKey)

    const recordType = recordTerm.termType()
    assertInstanceOf(recordType, RecordType)

    const fieldType = recordType.fieldTypes.get(fieldKey)
    if(!fieldType)
      throw new TypeError(`invalid record field ${fieldKey}`)

    super()

    this[$recordTerm] = recordTerm
    this[$fieldKey] = fieldKey
    this[$fieldType] = fieldType
  }

  get recordTerm() {
    return this[$recordTerm]
  }

  get fieldKey() {
    return this[$fieldKey]
  }

  get fieldType() {
    return this[$fieldType]
  }

  freeTermVariables() {
    return this.recordTerm.freeTermVariables()
  }

  get termType() {
    return this.fieldType
  }

  validateVarType(termVar, type) {
    return this.recordTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    return this.recordTerm.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { recordTerm, fieldKey } = this

    const newRecordTerm = recordTerm.bindTerm(termVar, term)

    if(newRecordTerm !== recordTerm) {
      return new ProjectRecordTerm(newRecordTerm, fieldKey)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { recordTerm, fieldKey } = this

    const newRecordTerm = recordTerm.bindType(typeVar, type)

    if(newRecordTerm !== recordTerm) {
      return new ProjectRecordTerm(newRecordTerm, fieldKey)

    } else {
      return this
    }
  }

  evaluate() {
    const { recordTerm, fieldKey } = this

    if(recordTerm instanceof RecordTerm) {
      return recordTerm.getFieldTerm(fieldKey).evaluate()
    }

    const newRecordTerm = recordTerm.evaluate()

    if(newRecordTerm !== recordTerm) {
      return new ProjectRecordTerm(newRecordTerm, fieldKey)

    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    throw new Error('not yet implemented')
  }

  formatTerm() {
    const { recordTerm, fieldKey } = this

    const recordTermRep = recordTerm.formatTerm()

    return ['project-record', fieldKey, recordTermRep]
  }
}

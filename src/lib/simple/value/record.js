import { assertRecordType } from '../type/record'
import { isInstanceOf, assertInstanceOf } from '../../assert'

const $recordType = Symbol('@recordType')
const $valueRecord = Symbol('@valueRecord')

export class TypedRecord {
  constructor(recordType, valueRecord) {
    assertRecordType(recordType)

    const err = recordType.checkValueRecord(valueRecord)
    if(err) throw err

    this[$recordType] = recordType
    this[$valueRecord] = valueRecord
  }

  get recordType() {
    return this[$recordType]
  }

  get valueRecord() {
    return this[$valueRecord]
  }

  size() {
    return this.valueRecord.size
  }

  keyNode() {
    return this.valueRecord.keyNode
  }

  valueNode() {
    return this.valueRecord.valueNode
  }

  get(key) {
    return this.valueRecord.get(key)
  }

  set(key, value) {
    const { recordType, valueRecord } = this
    const valueType = recordType.getFieldType(key)

    const err = valueType.checkValue(value)
    if(err) throw err

    const newRecord = valueRecord.set(key, value)

    if(newRecord === valueRecord)
      return this

    return new TypedRecord(recordType, newRecord)
  }

  $get(i) {
    return this.valueRecord.$get(i)
  }

  $set(i, value) {
    const { recordType, valueRecord } = this
    const newRecord = valueRecord.$set(i, value)

    if(newRecord === valueRecord)
      return this

    return new TypedRecord(recordType, newRecord)
  }

  keys() {
    return this.valueRecord.keys()
  }

  values() {
    return this.valueRecord.values()
  }

  entries() {
    return this.valueRecord.entries()
  }

  // Returns normal record
  // mapValues :: This -> (Any -> Any) -> Record
  mapValues(mapper) {
    return this.valueRecord.mapValues(mapper)
  }
}

export const typedRecord = (recordType, valueRecord) =>
  new TypedRecord(recordType, valueRecord)

export const isTypedRecord = record =>
  isInstanceOf(record, TypedRecord)

export const assertTypedRecord = record =>
  assertInstanceOf(record, TypedRecord)

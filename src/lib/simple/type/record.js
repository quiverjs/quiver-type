import { typeImpl } from './impl'
import { Type, isType } from './type'
import { isTypedRecord } from '../value/record'
import { isInstanceOf, assertInstanceOf } from '../../assert'
import {
  assertRecord, isRecord, zipIter, recordFromObject
} from '../../container'

const $typeRecord = Symbol('@typeRecord')

export const assertTypeRecord = typeRecord => {
  assertRecord(typeRecord)

  if(typeRecord.size === 0)
    throw new Error('type record must have non zero size')

  if(!typeRecord.valueNode.checkPred(isType))
    throw new TypeError('values in type record must be type')
}

export const checkTypeRecord = (typeRecord1, typeRecord2) => {
  if(typeRecord1.size !== typeRecord2.size)
    return new TypeError('target record type have different size')

  for(const [entry1, entry2] of zipIter(
    typeRecord1.entries(), typeRecord2.entries()))
  {
    const [key1, type1] = entry1
    const [key2, type2] = entry2

    if(key1 !== key2)
      return new TypeError('target record type have different field names')

    const err = type1.checkType(type2)
    if(err) return err
  }

  return null
}

const formatTypeEntries = function*(entries) {
  for(const [key, type] of entries) {
    yield [key, type.formatType()]
  }
}

export const RecordType = typeImpl(
  class extends Type {
    constructor(typeRecord) {
      assertTypeRecord(typeRecord)

      super()

      this[$typeRecord] = typeRecord
    }

    get typeRecord() {
      return this[$typeRecord]
    }

    checkType(targetType) {
      if(!isInstanceOf(targetType, RecordType))
        return new TypeError('target type must be record type')

      return checkTypeRecord(this.typeRecord, targetType.typeRecord)
    }

    // checkValue :: Any -> Maybe Error
    checkValue(record) {
      if(!isTypedRecord(record))
        return new TypeError('value must be instance of TypedRecord')

      const { recordType } = record
      return this.checkType(recordType)
    }

    getFieldType(key) {
      const { typeRecord } = this
      return typeRecord.get(key)
    }

    $getFieldType(i) {
      const { typeRecord } = this
      return typeRecord.$get(i)
    }

    // checkValueRecord :: Record Any -> Maybe Error
    checkValueRecord(valueRecord) {
      if(!isRecord(valueRecord))
        return new TypeError('valueRecord must be a record')

      const { typeRecord } = this

      if(typeRecord.size !== valueRecord.size)
        return new TypeError('value record have different size')

      for(const [entry1, entry2] of zipIter(
        typeRecord.entries(), valueRecord.entries()))
      {
        const [key1, type] = entry1
        const [key2, value] = entry2

        if(key1 !== key2)
          return new TypeError('value record have different field names')

        const err = type.checkValue(value)
        if(err) return err
      }

      return null
    }

    formatType() {
      const { typeRecord } = this
      const fieldRep = [...formatTypeEntries(typeRecord.entries())]
      return ['record-type', fieldRep]
    }
  })

export const recordType = typeObject =>
  new RecordType(recordFromObject(typeObject))

export const isRecordType = recordType =>
  isInstanceOf(recordType, RecordType)

export const assertRecordType = recordType =>
  assertInstanceOf(recordType, RecordType)

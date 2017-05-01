import { typeImpl } from './impl'
import { Type, assertType } from './type'
import { isInstanceOf } from '../common/assert'
import { assertRecord, isRecord, zipIter } from '../container'

const $typeRecord = Symbol('@typeRecord')

export const RecordType = typeImpl(
  class extends Type {
    constructor(typeRecord) {
      assertRecord(typeRecord)

      if(typeRecord.size === 0)
        throw new Error('type record must have non zero size')

      for(const subType of typeRecord.values()) {
        assertType(subType)
      }

      super()

      this[$typeRecord] = typeRecord
    }

    get typeRecord() {
      return this[$typeRecord]
    }

    checkType(targetType) {
      if(!isInstanceOf(targetType, RecordType))
        return new TypeError('target type must be record type')

      const { typeRecord } = this
      const typeRecord2 = targetType.typeRecord

      if(typeRecord.size !== typeRecord2.size)
        return new TypeError('target record type have different size')

      for(const [entry1, entry2] of zipIter(
        typeRecord.entries(), typeRecord2.entries()))
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

    checkValue(valueRecord) {
      if(!isRecord(valueRecord))
        return new TypeError('value must be a record')

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
  })

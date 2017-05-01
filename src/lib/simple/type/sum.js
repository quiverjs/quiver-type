import { typeImpl } from './impl'
import { Type } from './type'
import { isInstanceOf } from '../common/assert'
import { isUnion, equalItems } from '../container'
import { assertTypeRecord, checkTypeRecord } from './record'

const $typeRecord = Symbol('@typeRecord')

export const SumType = typeImpl(
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
      if(!isInstanceOf(targetType, SumType))
        return new TypeError('target type must be sum type')

      return checkTypeRecord(this.typeRecord, targetType.typeRecord)
    }

    checkValue(union) {
      if(!isUnion(union))
        return new TypeError('value must be a union')

      const valueType = union.typeTag

      const err = this.checkType(valueType)
      if(err) return err

      const { typeRecord } = this

      if(!equalItems(typeRecord.keyNode, union.keyNode))
        return new TypeError('union value have different case tags')

      const { caseIndex, value } = union.caseIndex
      const caseType = typeRecord.rawGet(caseIndex)

      return caseType.checkValue(value)
    }
  })

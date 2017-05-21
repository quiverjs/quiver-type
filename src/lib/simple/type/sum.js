import { typeImpl } from './impl'
import { Type } from './type'
import { isVariantValue } from '../value/variant'
import { assertTypeRecord, checkTypeRecord } from './record'
import { isInstanceOf, assertInstanceOf } from '../common/assert'

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

    getCaseType(caseTag) {
      const { typeRecord } = this
      return typeRecord.get(caseTag)
    }

    getCaseIndex(caseIndex) {
      const { typeRecord } = this
      return typeRecord.getRaw(caseIndex)
    }

    checkType(targetType) {
      if(!isInstanceOf(targetType, SumType))
        return new TypeError('target type must be sum type')

      return checkTypeRecord(this.typeRecord, targetType.typeRecord)
    }

    checkValue(variant) {
      if(!isVariantValue(variant))
        return new TypeError('value must instance of VariantValue')

      const { sumType } = variant

      return this.checkType(sumType)
    }
  })

export const isSumType = sumType =>
  isInstanceOf(sumType, SumType)

export const assertSumType = sumType =>
  assertInstanceOf(sumType, SumType)

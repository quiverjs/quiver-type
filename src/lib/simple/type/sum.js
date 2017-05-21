import { Type } from './type'
import { typeImpl } from './impl'
import { isVariantValue } from '../value/variant'
import { recordFromObject } from '../../container'
import { assertTypeRecord, checkTypeRecord } from './record'
import { isInstanceOf, assertInstanceOf } from '../../assert'

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

    // getCaseType :: This -> Key -> Type
    getCaseType(caseTag) {
      const { typeRecord } = this
      return typeRecord.get(caseTag)
    }

    // $getCaseType :: This -> Nat -> Type
    $getCaseType(caseIndex) {
      const { typeRecord } = this
      return typeRecord.$get(caseIndex)
    }

    // getCaseIndex :: This -> Key -> Nat
    getCaseIndex(caseTag) {
      const { typeRecord } = this
      return typeRecord.getKeyIndex(caseTag)
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

export const sumType = typeObject =>
  new SumType(recordFromObject(typeObject))

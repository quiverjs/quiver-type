import { assertNat, isInstanceOf, assertInstanceOf } from '../../assert'
import { assertSumType } from '../type/sum'

const $sumType = Symbol('@sumType')
const $caseIndex = Symbol('@caseIndex')
const $caseType = Symbol('@caseType')
const $value = Symbol('@value')

export class VariantValue {
  // constructor :: This -> SumType -> Nat -> ()
  constructor(sumType, caseIndex, value) {
    assertSumType(sumType)
    assertNat(caseIndex)

    const caseType = sumType.getCaseIndex(caseIndex)

    const err = caseType.checkType(value)
    if(err) throw err

    this[$sumType] = sumType
    this[$caseIndex] = caseIndex
    this[$caseType] = caseType
    this[$value] = value
  }

  get sumType() {
    return this[$sumType]
  }

  get caseIndex() {
    return this[$caseIndex]
  }

  get caseType() {
    return this[$caseType]
  }

  get value() {
    return this[$value]
  }

  get typeRecord() {
    return this.sumType.typeRecord
  }
}

export const isVariantValue = variant =>
  isInstanceOf(variant, VariantValue)

export const assertVariantValue = variant =>
  assertInstanceOf(variant, VariantValue)

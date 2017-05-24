import { assertType } from './type'
import { ArrowType } from './arrow'
import { assertSumType } from './sum'
import { RecordType } from './record'
import { isInstanceOf, assertInstanceOf } from '../../assert'

const $sumType = Symbol('@sumType')
const $arrowType = Symbol('@arrowType')

export class CaseType extends RecordType {
  constructor(sumType, returnType) {
    assertSumType(sumType)
    assertType(returnType)

    const arrowType = new ArrowType(sumType, returnType)

    const { typeRecord } = sumType
    const caseRecord = typeRecord.mapValues(
      fieldType => new ArrowType(fieldType, returnType))

    super(caseRecord)

    this[$sumType] = sumType
    this[$arrowType] = arrowType
  }

  get sumType() {
    return this[$sumType]
  }

  get arrowType() {
    return this[$arrowType]
  }

  formatType() {
    const { sumType, returnType } = this

    const sumRep = sumType.formatType()
    const returnRep = returnType.formatType()

    return ['case-type', sumRep, returnRep]
  }
}

// caseType :: SumType -> Type -> RecordType
export const caseType = (sumType, returnType) =>
  new CaseType(sumType, returnType)

export const isCaseType = caseType =>
  isInstanceOf(caseType, CaseType)

export const assertCaseType = caseType =>
  assertInstanceOf(caseType, CaseType)

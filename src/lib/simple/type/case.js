import { assertType } from './type'
import { ArrowType } from './arrow'
import { WrapperType } from './wrapper'
import { assertSumType } from './sum'
import { RecordType } from './record'

const $sumType = Symbol('@sumType')
const $recordType = Symbol('@recordType')

export class CaseType extends WrapperType {
  constructor(sumType, returnType) {
    assertSumType(sumType)
    assertType(returnType)

    const { typeRecord } = sumType
    const resultType = typeRecord.mapValues(
      fieldType => new ArrowType(fieldType, returnType))

    const recordType = new RecordType(resultType)

    super()

    this[$sumType] = sumType
    this[$recordType] = recordType
  }

  get sumType() {
    return this[$sumType]
  }

  get recordType() {
    return this[$recordType]
  }

  get realType() {
    return this.recordType
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

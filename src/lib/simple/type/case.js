import { ArrowType } from './arrow'
import { assertSumType } from './sum'
import { RecordType } from './record'

// caseType :: SumType -> Type -> RecordType
export const caseType = (sumType, returnType) => {
  assertSumType(sumType)

  const { typeRecord } = sumType
  const resultType = typeRecord.mapValues(
    fieldType => new ArrowType(fieldType, returnType))

  return new RecordType(resultType)
}

import { assertType } from '../type/type'
import { assertRecord } from '../container'
import { assertSumType } from '../type/sum'

export class CaseValue {
  // constructor :: This -> SumType -> Record ArrowValue -> Type -> ()
  constructor(sumType, caseRecord, returnType) {
    assertSumType(sumType)
    assertRecord(caseRecord)
    assertType(returnType)
  }
}

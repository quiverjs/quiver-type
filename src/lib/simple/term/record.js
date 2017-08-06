import { termImpl } from './impl'
import { Term } from './term'
import { assertRecordType } from '../type/record'
import { assertRecord } from '../../container'

export const RecordTerm = termImpl(
  class extends Term {
    constructor(recordType, termRecord) {
      assertRecordType(recordType)
      assertRecord(termRecord)
    }
  })

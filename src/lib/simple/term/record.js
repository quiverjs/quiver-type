
export const RecordTerm = termImpl(
  class extends Term {
    constructor(recordType, termRecord) {
      assertRecordType(recordType)
      assertRecord(termRecord)
    }
  })

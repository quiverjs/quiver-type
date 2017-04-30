import { assertRecord } from '../record/assert'
import { getItem, equalItems } from '../list/algo'

const $keyNode = Symbol('@keyNode')
const $caseIndex = Symbol('@caseIndex')
const $value = Symbol('value')

export class Union {
  constructor(keyNode, caseIndex, value) {
    this[$keyNode] = keyNode
    this[$caseIndex] = caseIndex
    this[$value] = value
  }

  get keyNode() {
    return this[$keyNode]
  }

  get caseIndex() {
    return this[$caseIndex]
  }

  get value() {
    return this[$value]
  }

  get caseTag() {
    const { keyNode, caseIndex } = this
    return getItem(keyNode, caseIndex)
  }

  match(cases) {
    assertRecord(cases)
    if(!equalItems(this.keyNode, cases.keyNode))
      throw new Error('case record has different keys than union')

    return this.rawMatch(cases)
  }

  rawMatch(cases) {
    const { caseIndex, value } = this
    const caseFunc = cases.rawGet(caseIndex)
    return caseFunc(value)
  }
}

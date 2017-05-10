import { assertKeyNode } from '../node'
import { assertRecord } from '../record'
import { getItem, equalItems } from '../algo'
import {
  assertNat,
  isInstanceOf,
  assertInstanceOf
} from '../assert'

const $keyNode = Symbol('@keyNode')
const $caseIndex = Symbol('@caseIndex')
const $value = Symbol('value')

export class Union {
  // constructor :: This -> Node Key -> Nat -> Any -> ()
  constructor(keyNode, caseIndex, value) {
    assertKeyNode(keyNode)
    assertNat(caseIndex)

    const keySize = keyNode.size
    if(caseIndex > keySize)
      throw new Error(`case index ${caseIndex} is larger than key node size ${keySize}`)


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

  // match :: Record (Any -> Any) -> Any
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

export const union = (keyNode, caseIndex, value) =>
  new Union(keyNode, caseIndex, value)

export const isUnion = union =>
  isInstanceOf(union, Union)

export const assertUnion = union =>
  assertInstanceOf(union, Union)

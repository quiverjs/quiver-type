import { Union } from './union'
import { assertKeyNode } from '../node/assert'
import { assertUInt } from '../common/assert'

export const union = (keyNode, caseIndex, value) => {
  assertKeyNode(keyNode)
  assertUInt(caseIndex)

  if(caseIndex > keyNode.size)
    throw new Error(`case index ${caseIndex} is larger than key node size`)

  return new Union(keyNode, caseIndex, value)
}

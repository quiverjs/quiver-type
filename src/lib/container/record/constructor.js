import { Record } from './record'
import { entriesIterToNode } from './algo'
import { assertNode, assertKeyNode } from '../node/assert'

export const recordFromNode = (keyNode, valueNode) => {
  assertKeyNode(keyNode)
  assertNode(valueNode)

  if(keyNode.size !== valueNode.size)
    throw new Error('size of keys and values must match')

  return new Record(keyNode, valueNode)
}

export const recordFromEntries = it => {
  const [keyNode, valueNode] = entriesIterToNode(it)
  return recordFromNode(keyNode, valueNode)
}

export const recordFromMap = map =>
  recordFromEntries(map.entries())

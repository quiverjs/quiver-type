import { Record } from './record'
import { entryIterToNode } from './algo'

export const recordFromNode = (keyNode, valueNode) =>
  new Record(keyNode, valueNode)

export const recordFromEntries = it => {
  const [keyNode, valueNode] = entryIterToNode(it)
  return recordFromNode(keyNode, valueNode)
}

export const recordFromMap = map =>
  recordFromEntries(map.entries())

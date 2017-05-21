import { Record } from './record'
import { entryIterToNodes, objectEntries } from '../algo'

export const recordFromNode = (keyNode, valueNode) =>
  new Record(keyNode, valueNode)

export const recordFromEntries = it => {
  const [keyNode, valueNode] = entryIterToNodes(it)
  return recordFromNode(keyNode, valueNode)
}

export const recordFromObject = object =>
  recordFromEntries(objectEntries(object))

import { Map } from './map'
import { nodeFromEntriesIter } from './algo'
import { assertEntryNode } from '../node/assert'

export const mapFromNode = node => {
  assertEntryNode(node)
  return new Map(node)
}

export const mapFromEntries = it => {
  const node = nodeFromEntriesIter(it)
  return new Map(node)
}

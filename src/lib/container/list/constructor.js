import { List } from './list'
import { nodeFromIter } from './algo'
import { assertMaybeNode } from '../node/assert'

export const emptyList = new List(null)

export const listFromNode = node => {
  assertMaybeNode(node)
  return new List(node)
}

export const listFromIter = it => {
  const node = nodeFromIter(it)
  return new List(node)
}

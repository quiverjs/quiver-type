import { List } from './list'
import { iterToNode } from '../algo'
import { nil, assertNode } from '../node'

export const emptyList = new List(nil)

export const listFromNode = node => {
  assertNode(node)
  return new List(node)
}

export const listFromIter = it => {
  const node = iterToNode(it)
  return new List(node)
}

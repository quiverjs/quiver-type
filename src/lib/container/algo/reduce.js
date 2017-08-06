import { assertNode } from '../node'

const doReduceNode = (node, reducer, acc, i) => {
  if(node.isNil()) return acc

  const { item, next } = node

  const newAcc = reducer(acc, item, i)

  return doReduceNode(next, reducer, newAcc, i+1)
}

export const reduceNode = (node, reducer, acc) => {
  assertNode(node)

  return doReduceNode(node, reducer, acc, 0)
}

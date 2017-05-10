import { cons, nil } from '../node'

export const prependItem = (node, item) =>
  cons(item, node)

// appendItem :: Node -> Any -> Node
export const appendItem = (node, newItem) => {
  if(node.isNil())
    return cons(newItem, nil)

  const { item, next } = node
  const newNext = appendItem(next, newItem)

  return cons(item, newNext)
}

// concatNodes :: Node -> Node -> Node
export const concatNodes = (node1, node2) => {
  if(node1.isNil())
    return node2

  if(node2.isNil())
    return node1

  const { item, next } = node1
  const newNext = concatNodes(next, node2)

  return cons(item, newNext)
}

const doReverseNode = (node, acc) => {
  if(node.isNil())
    return acc

  const { item, next } = node
  const newAcc = cons(item, acc)

  return doReverseNode(next, newAcc)
}

export const reverseNode = node =>
  doReverseNode(node, nil)

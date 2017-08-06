import { cons } from '../node'

const doDeleteItem = (node, pred, i) => {
  if(node.isNil())
    return node

  const { item, next } = node

  if(pred(item, i))
    return next

  const newNext = doDeleteItem(next, pred, i+1)

  if(newNext === next)
    return node

  return cons(item, newNext)
}

export const findDeleteItem = (node, pred) =>
  doDeleteItem(node, pred, 0)

// deleteItem :: Node -> (Any -> Nat -> Bool) -> Node
export const deleteItem = (node, target) =>
  findDeleteItem(node, item => (item === target))

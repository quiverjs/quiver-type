import { cons, nil } from '../node'

// getItem :: Node -> Nat -> Error Any
export const getItem = (node, i) => {
  if(node.isNil())
    throw new Error('index out of bound')

  if(i === 0) return node.item

  return getItem(node.next, i-1)
}

// setItem :: Node -> Nat -> Any -> Node
export const setItem = (node, i, newItem) => {
  if(node.isNil())
    throw new Error('index out of bound')

  if(i === 0)
    return cons(newItem, node.next)

  const { item, next } = node
  const newNext = setItem(next, i-1, newItem)

  return cons(item, newNext)
}

export const hasItem = (node, target) => {
  if(node === nil)
    return false

  const { item, next } = node

  if(item === target)
    return true

  return hasItem(next, target)
}

export const deleteItem = (node, target) => {
  if(node.isNil())
    return node

  const { item, next } = node

  if(item === target)
    return next

  const newNext = deleteItem(next, target)

  if(newNext === next)
    return node

  return cons(item, newNext)
}

import { cons } from '../node'

const doGetItem = (node, i) => {
  if(i === 0) {
    return node.item
  } else {
    return doGetItem(node.next, i-1)
  }
}

// getItem :: Node -> Nat -> Any
export const getItem = (node, i) => {
  if(i >= node.size)
    throw new Error('index out of bound')

  return doGetItem(node, i)
}

const doSetItem = (node, i, newItem) => {
  if(i === 0)
    return cons(newItem, node.next)

  const { item, next } = node
  const newNext = doSetItem(next, i-1, newItem)

  return cons(item, newNext)
}

// setItem :: Node -> Nat -> Any -> Node
export const setItem = (node, i, newItem) => {
  if(i >= node.size)
    throw new Error('index out of bound')

  return doSetItem(node, i, newItem)
}

export const hasItem = (node, target) => {
  if(node.isNil())
    return false

  const { item, next } = node

  if(item === target)
    return true

  return hasItem(next, target)
}

const doFindItem = (node, pred, i) => {
  if(node.isNil())
    return -1

  const { item, next } = node

  if(pred(item))
    return i

  return doFindItem(next, pred, i+1)
}

// findItem :: Node -> Any -> Int
export const findItem = (node, pred) => {
  return doFindItem(node, pred, 0)
}

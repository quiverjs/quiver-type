import { Node } from '../node'

// nodeFromIter :: NodeConstructor -> Iterator -> Node
export const nodeFromIter = it => {
  const { value, done } = it.next()

  if(done)
    return null

  const next = nodeFromIter(it)
  const node = new Node(value, next)

  return node
}

// nodeToIter :: Node -> Iterator
export const nodeToIter = function*(node) {
  while(node !== null) {
    yield node.item
    node = node.next
  }
}

// nodeToEntriesIter :: Node -> Iterator
export const nodeToEntriesIter = function*(node) {
  let i = 0

  while(node !== null) {
    yield [i, node.item]
    i += 1
    node = node.next
  }
}

// getItem :: Node -> Int -> Error Any
export const getItem = (node, i) => {
  if(node === null)
    throw new Error('index out of bound')

  if(i === 0) return node.item

  return getItem(node.next, i-1)
}

// setItem :: Node -> Int -> Any -> Node
export const setItem = (node, i, item) => {
  if(node === null)
    throw new Error('index out of bound')

  if(i === 0)
    return new Node(item, null)

  const { item, next } = node
  const newNext = setItem(next, i-1, item)

  return new Node(item, newNext)
}

export const hasItem = (node, target) => {
  if(node === null)
    return false

  const { item, next } = node

  if(item === target)
    return true

  return findItem(next, target)
}

const doFindItem = (node, pred, i) => {
  if(node === null)
    return -1

  const { item, next } = node

  if(pred(item))
    return i

  return findItem(next, pred, i+1)
}

// findItem :: Node -> Any -> Int
export const findItem = (node, pred) => {
  return doFindItem(node, pred, 0)
}

const doMap = (node, mapper, i) => {
  const { item, next } = node

  const mapped = mapper(item, i)
  const newNext = doMap(next, mapper, i+1)

  if(mapped === item && newNext === next)
    return this

  return new Node(mapped, newNext)
}

// map :: Node -> (Any -> Any) -> Node
export const mapNode = (node, mapper) =>
  doMap(node, mapper, 0)

// appendItem :: Node -> Any -> Node
export const appendItem = (node, newItem) => {
  if(node === null)
    return new Node(newItem, null)

  const { item, next } = node
  const newNext = appendItem(next, newItem)

  return new Node(item, newNext)
}

const doEqualItems = (node1, node2) => {
  if(node1 === null && node2 === null)
    return true

  if(node1.item !== node2.item)
    return false

  return doEqualItems(node1.next, node2.next)
}

// equalItems :: Node -> Node -> Bool
export const equalItems = (node1, node2) => {
  if(node1 === node2)
    return true

  if(node1 === null || node2 === null)
    return false

  if(node1.size !== node2.size)
    return false

  return doEqualItems(node1, node2)
}

export const concatNodes = (node1, node2) => {
  if(node1 === null)
    return node2

  if(node2 === null)
    return node1

  const { item, next } = node1
  const newNext = concatNodes(next, node2)

  return new Node(item, newNext)
}

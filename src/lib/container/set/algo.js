import { Node } from '../node'
import { hasItem } from '../list/algo'

export const insertUnique = (node, item) => {
  const exist = hasItem(node, item)

  if(exist)
    return node

  return new Node(item, node)
}

export const deleteItem = (node, target) => {
  if(node === null)
    return null

  const { item, next } = node

  if(item === target)
    return next

  const newNext = deleteItem(next, target)

  if(newNext === next)
    return node

  return new Node(item, newNext)
}

export const unionSet = (node1, node2) => {
  if(node1 === null)
    return node2

  if(node2 === null)
    return node1

  while(node2 !== null) {
    const { item, next } = node2
    node1 = insertUnique(node1, item)
    node2 = next
  }

  return node1
}

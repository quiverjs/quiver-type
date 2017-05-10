import { cons, nil } from '../node'
import { hasItem } from './accessor'

export const insertUnique = (node, item) => {
  const exist = hasItem(node, item)

  if(exist)
    return node

  return cons(item, node)
}

export const unionSet = (node1, node2) => {
  if(node1.isNil())
    return node2

  if(node2.isNil())
    return node1

  if(node2.size < node1.size)
    return unionSet(node2, node1)

  while(!node2.isNil()) {
    const { item, next } = node2
    node1 = insertUnique(node1, item)
    node2 = next
  }

  return node1
}

export const iterToSet = it => {
  let node = nil
  for(const item of it) {
    node = insertUnique(node, item)
  }
  return node
}

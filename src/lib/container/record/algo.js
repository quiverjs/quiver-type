import { Node } from '../node/node'
import { nodeFromIter } from '../list/algo'

export const getValue = (keyNode, valueNode, key) => {
  if(keyNode === null)
    throw new Error(`key not found in record: ${key}`)

  if(keyNode.item === key)
    return valueNode.item

  return getValue(keyNode.next, valueNode.next, key)
}

export const setValue = (keyNode, valueNode, key, value) => {
  if(keyNode === null)
    throw new Error(`key not found in record: ${key}`)

  if(keyNode.item === key)
    return new Node(value, valueNode.next)

  const currentValue = valueNode.item
  const newNext = setValue(keyNode, valueNode, key, value)

  return new Node(currentValue, newNext)
}

export const entriesIterToNode = it => {
  const { value: entry, done } = it.next()

  if(done)
    return [null, null]

  const [nextKey, nextValue] = nodeFromIter(it)
  const [key, value] = entry

  const keyNode = new Node(key, nextKey)
  const valueNode = new Node(value, nextValue)

  return [keyNode, valueNode]
}

export const nodesToIter = function*(node1, node2) {
  while(node1 !== null) {
    yield [node1.item, node2.item]
    node1 = node1.next
    node2 = node2.next
  }
}

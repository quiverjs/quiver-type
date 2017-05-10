import { cons } from '../node'

// getRecordValue :: Node Key -> Node -> Key -> Any
export const getRecordValue = (keyNode, valueNode, key) => {
  if(keyNode.isNil())
    throw new Error(`key not found in record: ${key}`)

  if(keyNode.item === key)
    return valueNode.item

  return getRecordValue(keyNode.next, valueNode.next, key)
}

// setRecordValue :: Node Key -> Node -> Key -> Any -> Node
export const setRecordValue = (keyNode, valueNode, key, value) => {
  if(keyNode.isNil())
    throw new Error(`key not found in record: ${key}`)

  if(keyNode.item === key) {
    if(valueNode.item === value) {
      return valueNode
    } else {
      return cons(value, valueNode.next)
    }
  }

  const { item: currentValue, next: nextValue } = valueNode

  const newNext = setRecordValue(keyNode.next, nextValue, key, value)

  if(newNext === nextValue)
    return valueNode

  return cons(currentValue, newNext)
}

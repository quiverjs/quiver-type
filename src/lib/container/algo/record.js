import { cons, nil } from '../node'

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

const $mapRecordValues = (keyNode, valueNode, mapper, i) => {
  if(valueNode.isNil())
    return nil

  const newValue = mapper(valueNode.item, keyNode.item, i)
  const newNext = $mapRecordValues(keyNode.next, valueNode.next, mapper, i+1)

  return cons(newValue, newNext)
}

// mapRecordValues :: Node Key -> Node Any -> (Any -> Any) -> Node Any
export const mapRecordValues = (keyNode, valueNode, mapper) =>
  $mapRecordValues(keyNode, valueNode, mapper, 0)

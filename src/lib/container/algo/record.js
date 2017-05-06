import { cons } from '../node'

export const getValue = (keyNode, valueNode, key) => {
  if(keyNode.isNil())
    throw new Error(`key not found in record: ${key}`)

  if(keyNode.item === key)
    return valueNode.item

  return getValue(keyNode.next, valueNode.next, key)
}

export const setValue = (keyNode, valueNode, key, value) => {
  if(keyNode.isNil())
    throw new Error(`key not found in record: ${key}`)

  if(keyNode.item === key)
    return cons(value, valueNode.next)

  const currentValue = valueNode.item
  const newNext = setValue(keyNode, valueNode, key, value)

  return cons(currentValue, newNext)
}

import { cons, Entry } from '../node'

// getEntry :: Node Entry -> Key -> (Bool, Any)
export const getEntry = (node, targetKey) => {
  if(node === null)
    return [false, undefined]

  const { item, next } = node
  const { key, value } = item

  if(key === targetKey)
    return [true, value]

  return getEntry(next, targetKey)
}

// mapEntry :: Node Entry -> (Any -> Any) -> Node Entry
export const mapEntry = (node, mapper) => {
  const { item, next } = node
  const { key, value } = item

  const mappedValue = mapper(value, key)
  const mappedNext = mapEntry(next, mapper)

  const mappedEntry = new Entry(key, mappedValue)
  return cons(mappedEntry, mappedNext)
}

const doSetEntry = (node, targetKey, targetValue) => {
  const { item, next } = node
  const { key, value } = item

  if(key === targetKey) {
    if(value === targetValue)
      return [true, node]

    const newEntry = new Entry(key, targetValue)
    const newNode = cons(newEntry, next)

    return [true, newNode]

  } else {
    const [found, newNext] = doSetEntry(next, targetKey, targetValue)

    if(newNext === next) {
      return [found, node]
    } else {
      const newNode = cons(item, newNext)
      return [found, newNode]
    }
  }
}

// setEntry :: Node Entry -> Key -> Value -> Node Entry
export const setEntry = (node, key, value) => {
  const [found, newNode] = doSetEntry(node, key, value)

  if(found)
    return newNode

  const entry = new Entry(key, value)
  return cons(entry, node)
}

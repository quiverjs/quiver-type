import { nil, cons, entry } from '../node'

const ownKeys = function*(object) {
  yield* Object.getOwnPropertyNames(object)
  yield* Object.getOwnPropertySymbols(object)
}

export const objectEntries = function*(object) {
  for(const key of ownKeys(object)) {
    yield [key, object[key]]
  }
}

export const findEntry = (node, targetKey) => {
  if(node.isNil())
    return [false]

  const { item, next } = node
  const [key, value] = item

  if(key === targetKey)
    return [true, value]

  return findEntry(next, targetKey)
}

// getEntry :: Node Entry -> Key -> (Bool, Any)
export const getEntry = (node, key) => {
  const [found, value] = findEntry(node, key)
  if(!found)
    throw new Error(`entry not found for key: ${key}`)

  return value
}

export const getOptionalEntry = (node, key, defaultValue) => {
  const [found, value] = findEntry(node, key)
  if(found) {
    return value
  } else {
    return defaultValue
  }
}

export const hasEntry = (node, key) => {
  const [found] = findEntry(node, key)
  return found
}

const doSetEntry = (node, targetKey, targetValue) => {
  const { item, next } = node
  const { key, value } = item

  if(key === targetKey) {
    if(value === targetValue)
      return [true, node]

    const newEntry = entry(key, targetValue)
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

  const entry = entry(key, value)
  return cons(entry, node)
}

export const entryIterToMap = it => {
  let node = nil

  for(const [key, value] of it) {
    node = setEntry(node, key, value)
  }

  return node
}

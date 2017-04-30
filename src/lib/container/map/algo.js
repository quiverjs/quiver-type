import { Node } from '../node/node'
import { Entry } from '../node/entry'

export const nodeFromEntriesIter = it => {
  const { value: entry, done } = it.next()

  if(done)
    return null

  const [key, value] = entry

  const next = nodeFromEntriesIter(it)
  const node = new Node(new Entry(key, value), next)

  return node
}


export const getEntry = (node, targetKey) => {
  if(node === null)
    return [false, undefined]

  const { item, next } = node
  const { key, value } = item

  if(key === targetKey)
    return [true, value]

  return getEntry(next, targetKey)
}

export const mapEntry = (node, mapper) => {
  const { item, next } = node
  const { key, value } = item

  const mappedValue = mapper(value, key)
  const mappedNext = mapEntry(next, mapper)

  const mappedEntry = new Entry(key, mappedValue)
  return new Node(mappedEntry, mappedNext)
}

const doSetEntry = (node, targetKey, targetValue) => {
  const { item, next } = node
  const { key, value } = item

  if(key === targetKey) {
    if(value === targetValue)
      return node

    const newEntry = new Entry(key, targetValue)
    const newNode = new Node(newEntry, next)

    return [true, newNode]

  } else {
    const [found, newNext] = doSetEntry(next, targetKey, targetValue)
    if(newNext === next) {
      return [found, node]
    } else {
      const newNode = new Node(item, newNext)
      return [found, newNode]
    }
  }
}

export const setEntry = (node, key, value) => {
  const [found, newNode] = doSetEntry(node, key, value)

  if(found)
    return newNode

  const entry = new Entry(key, value)
  return new Node(entry, node)
}

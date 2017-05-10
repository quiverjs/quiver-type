import { cons, makeEntry } from '../node'

const doMap = (node, mapper, i) => {
  const { item, next } = node

  const mapped = mapper(item, i)
  const newNext = doMap(next, mapper, i+1)

  if(mapped === item && newNext === next)
    return node

  return cons(mapped, newNext)
}

// map :: Node -> (Any -> Any) -> Node
export const mapNode = (node, mapper) =>
  doMap(node, mapper, 0)


// mapEntry :: Node Entry -> (Any -> Any) -> Node Entry
export const mapEntry = (node, mapper) =>
  mapNode(node, entry => {
    const [key, value] = entry
    const mappedValue = mapper(value, key)

    if(mappedValue === value)
      return entry

    return makeEntry(key, mappedValue)
  })

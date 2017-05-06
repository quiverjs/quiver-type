import { cons } from '../node'

const doMap = (node, mapper, i) => {
  const { item, next } = node

  const mapped = mapper(item, i)
  const newNext = doMap(next, mapper, i+1)

  return cons(mapped, newNext)
}

// map :: Node -> (Any -> Any) -> Node
export const mapNode = (node, mapper) =>
  doMap(node, mapper, 0)

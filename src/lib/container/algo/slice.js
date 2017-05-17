import { nil, cons } from '../node'

// sliceNode :: Node -> Nat -> (Node, Node)
export const sliceNode = (node, i) => {
  if(i === 0)
    return [nil, node]

  const { item, next } = node
  const [head, tail] = sliceNode(next, i-1)
  return [cons(item, head), tail]
}

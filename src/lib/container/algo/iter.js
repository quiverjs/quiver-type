import { cons, nil, Entry } from '../node'

// iterToNode :: Iterator Any -> Node
export const iterToNode = it => {
  const { value, done } = it.next()
  if(done) return nil

  const next = iterToNode(it)
  return cons(value, next)
}

// entryIterToNode :: Iterator Entry -> Node
export const entryIterToNode = it => {
  const { value: entry, done } = it.next()
  if(done) return nil

  const [key, value] = entry
  const next = entryIterToNode(it)
  return cons(new Entry(key, value), next)
}

// entryIterToNodes :: Iterator Entry -> (Node, Node)
export const entryIterToNodes = it => {
  const { value: entry, done } = it.next()

  if(done)
    return [nil, nil]

  const [key, value] = entry
  const [nextKey, nextValue] = entryIterToNodes(it)

  const keyNode = cons(key, nextKey)
  const valueNode = cons(value, nextValue)

  return [keyNode, valueNode]
}

// nodeToIter :: Node -> Iterator Any
export const nodeToIter = function*(node) {
  while(node !== nil) {
    yield node.item
    node = node.next
  }
}

// nodesToIter :: Node a -> Node b -> Iterator (a, b)
export const nodesToIter = function*(node1, node2) {
  while(!node1.isNil()) {
    yield [node1.item, node2.item]
    node1 = node1.next
    node2 = node2.next
  }

  if(!node2.isNil())
    throw new Error('node1 and node2 are of different size')
}

// nodeToEntryIter :: Node -> Iterator (Nat, Any)
export const nodeToEntryIter = function*(node) {
  let i = 0

  while(node !== nil) {
    yield [i, node.item]
    i += 1
    node = node.next
  }
}

// zipITer :: Iterator a -> Iterator b -> Iterator (a, b)
export const zipIter = function*(iter1, iter2) {
  try {
    while(true) {
      const { value: value1, done: done1 } = iter1.next()
      const { value: value2, done: done2 } = iter2.next()

      if(done1 && done2)
        return

      if(done1 || done2)
        throw new Error('one of the iterator ended before the other')

      yield [value1, value2]
    }
  } catch(err) {
    iter1.close()
    iter2.close()
    throw err
  }
}

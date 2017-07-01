// nodeToIter :: Node -> Iterator
export const nodeToIter = function*(node) {
  while(!node.isNil()) {
    const { item, next } = node
    yield item
    node = next
  }
}

// nodeToEntryIter :: Node -> Iterator (Nat, Any)
export const nodeToEntryIter = function*(node) {
  let i = 0

  while(!node.isNil()) {
    yield [i, node.item]
    i += 1
    node = node.next
  }
}

export const doGetPred = (node, pred) => {
  const { item, next } = node
  const currentResult = pred(item)

  if(!currentResult) return false

  return next.checkPred(pred)
}

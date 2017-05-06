
const doFindItem = (node, pred, i) => {
  if(node.isNil())
    return -1

  const { item, next } = node

  if(pred(item))
    return i

  return findItem(next, pred, i+1)
}

// findItem :: Node -> Any -> Int
export const findItem = (node, pred) => {
  return doFindItem(node, pred, 0)
}

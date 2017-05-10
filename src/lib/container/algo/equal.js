
const doEqualItems = (node1, node2, comparator) => {
  if(node1.isNil() && node2.isNil())
    return true

  const equals = comparator(node1.item, node2.item)
  if(!equals) return false

  return doEqualItems(node1.next, node2.next)
}

// equalItems :: Node -> Node -> (Any -> Any -> Bool) -> Bool
export const equalItems = (node1, node2, comparator) => {
  if(node1 === node2)
    return true

  if(node1.isNil() && node2.isNil())
    return true

  if(node1.isNil() || node2.isNil())
    return false

  if(node1.size !== node2.size)
    return false

  return doEqualItems(node1, node2, comparator)
}

export const strictEqual = (a, b) => (a === b)

// strictEqualItems :: Node -> Node -> Bool
export const strictEqualItems = (node1, node2) =>
  equalItems(node1, node2, strictEqual)

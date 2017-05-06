
const doEqualItems = (node1, node2) => {
  if(node1.isNil() && node2.isNil())
    return true

  if(node1.item !== node2.item)
    return false

  return doEqualItems(node1.next, node2.next)
}

// equalItems :: Node -> Node -> Bool
export const equalItems = (node1, node2) => {
  if(node1 === node2)
    return true

  if(node1.isNil() && node2.isNil())
    return true

  if(node1.isNil() || node2.isNil())
    return false

  if(node1.size !== node2.size)
    return false

  return doEqualItems(node1, node2)
}

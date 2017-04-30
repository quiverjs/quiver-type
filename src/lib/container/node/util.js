const doGetPred = (node, pred) => {
  if(node === null)
    return true

  const { item, next } = node
  const currentResult = pred(item)

  const nextResult = doGetPred(next, pred)
  return currentResult && nextResult
}

export const getPredResult = (node, key, pred) => {
  if(node === null)
    return true

  const { metadata } = node
  const cacheResult = metadata[key]

  if(cacheResult !== undefined)
    return cacheResult

  const result = doGetPred(node, pred)
  metadata[key] = result

  return result
}

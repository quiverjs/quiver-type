
export const fullReduce = expr => {
  const reduced = expr.reduce()
  if(reduced === expr) return expr

  return fullReduce(reduced)
}

const curriedFunction = func =>
  (...appliedArgs) => arg =>
    func(...appliedArgs, arg)

const terminalCurry = func =>
  arg => func(arg)

// currifyFunction :: Function -> Nat -> Function
export const currifyFunction = (func, arity) => {
  if(arity === 1) {
    return terminalCurry(func)
  } else {
    return currifyFunction(curriedFunction(func), arity-1)
  }
}

// nestedCurrifyFunction = Function -> Node Nat -> Function
export const nestedCurrifyFunction = (func, arities) => {
  const { item: arity, next } = arities

  if(next.isNil())
    return currifyFunction(func, arity)

  return currifyFunction((...args) =>
    nestedCurrifyFunction(func(...args), next),
    arity)
}

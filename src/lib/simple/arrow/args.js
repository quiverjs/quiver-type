// getReturnType :: arrowType -> Nat -> Type
export const getReturnType = (arrowType, argsSize) => {
  if(argsSize === 0)
    return arrowType

  return getReturnType(arrowType.rightType, argsSize-1)
}

// $checkArgs :: ArrowType -> Iterable Any -> Exception
const $checkArgs = (arrowType, args) => {
  for(const arg of args) {
    const { leftType, rightType } = arrowType

    const err = leftType.checkValue(arg)
    if(err) throw err

    arrowType = rightType
  }
}

// checkArgs :: ArrowType -> Node Any -> Exception
export const checkArgs = (arrowType, args) => {
  if(args.size !== arrowType.arity)
    throw new Error('not enough arguments provided')

  $checkArgs(arrowType, args)
}

// checkArgs :: ArrowType -> Node Any -> Exception
export const checkPartialArgs = (arrowType, args) => {
  if(args.size > arrowType.arity)
    throw new Error('too many arguments provided')

  $checkArgs(arrowType, args)
}


// checkArgsReturn :: ArrowType -> Iterable Any -> Bool -> Exception Type
const checkArgsReturn = (arrowType, args, checkType) => {
  for(const arg of args) {
    if(!arrowType.isArrowType)
      throw new Error('too many arguments provided')

    const { leftType, rightType } = arrowType

    if(checkType) {
      const err = leftType.checkType(arg)
      if(err) throw err
    }

    arrowType = rightType
  }

  return arrowType
}

export const getArgsReturn = (arrowType, args) =>
  checkArgsReturn(arrowType, args, false)

export const checkPartialArgs = (arrowType, args) =>
  checkArgsReturn(arrowType, args, true)

export const checkArgs = (arrowType, args) => {
  const returnType = checkPartialArgs(arrowType, args)

  if(returnType.isArrowType)
    throw new Error('not enough arguments provided')

  return returnType
}

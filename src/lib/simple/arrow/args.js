import { isArrowType } from '../type/arrow'

// checkArgsReturn :: ArrowType -> Iterable Any -> Bool -> Exception Type
const checkArgsReturn = (arrowType, args, checkType) => {
  for(const arg of args) {
    if(!isArrowType(arrowType))
      throw new Error('too many arguments provided')

    const { leftType, rightType } = arrowType

    if(checkType) {
      const err = leftType.checkValue(arg)
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

  if(isArrowType(returnType))
    throw new Error('not enough arguments provided')

  return returnType
}

import { Type } from '../type/type'
import { assertType } from '../core/assert'
import { Expression } from '../expr/expression'

export const isTerminalType = type => {
  assertType(type, Type)

  return type.freeTypeVariables().isEmpty()
}

export const isTerminalExpr = expr => {
  assertType(expr, Expression)

  return expr.freeTermVariables().isEmpty() &&
    isTerminalType(expr.exprType())
}

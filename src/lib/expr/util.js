import { List } from '../core/container'
import { assertType } from '../core/assert'

import { Expression } from './expression'

export const compileExpr = expr => {
  assertType(expr, Expression)

  return expr.compileBody(List())()
}

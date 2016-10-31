import { List } from '../core/container'
import { assertType } from '../core/assert'

import { Expression } from '../expr/expression'

export const compileExpr = expr => {
  assertType(expr, Expression)

  return expr.evaluate().compileBody(List())()
}

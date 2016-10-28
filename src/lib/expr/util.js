import { List } from '../core/container'
import { assertType } from '../core/assert'
import { formatLisp } from '../core/util'

import { Expression } from './expression'

export const compileExpr = expr => {
  assertType(expr, Expression)

  return expr.evaluate().compileBody(List())()
}

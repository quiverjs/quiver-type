import { inspect } from 'util'

import { List } from '../core/container'
import { assertType } from '../core/assert'

import { Expression } from './expression'

export const compileExpr = expr => {
  assertType(expr, Expression)

  return expr.compileBody(List())()
}

export const formatExpr = expr => {
  assertType(expr, Expression)

  const str = inspect(expr.formatExpr(), {
    depth: 10,
    breakLength: 80
  })

  const lispStr = str
    .replace(/[\,\'\"]/g, '')
    .replace(/\[\ /g, '(')
    .replace(/\ \]/g, ')')

  return lispStr
}

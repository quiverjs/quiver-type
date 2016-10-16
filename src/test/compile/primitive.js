import test from 'tape'

import { TermVariable } from 'lib/core'

import {
  ValueExpression,
  VariableExpression,
  compileExpr
} from 'lib/expr'

import { NumberType } from '../util'

test('expression compilation test', assert => {
  assert.test('constant expression', assert => {
    const valueExpr = new ValueExpression(8, NumberType)
    const compiled = compileExpr(valueExpr)

    assert.equals(compiled, 8)
    assert.end()
  })

  assert.test('variable expression', assert => {
    const xVar = new TermVariable('x')
    const varExpr = new VariableExpression(xVar, NumberType)

    assert.throws(() => compileExpr(varExpr))

    assert.end()
  })
})

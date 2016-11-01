import test from 'tape'

import {
  TermVariable, List
} from '../lib/core'

import {
  BodyExpression,
  VariableExpression,
  TermLambdaExpression
} from '../lib/expr'

import { compileExpr } from '../lib/util'

import { NumberType } from './util'

test('expression compilation test', assert => {
  assert.test('body expression', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const xVarExpr = new VariableExpression(xVar, NumberType)
    const yVarExpr = new VariableExpression(yVar, NumberType)

    const addExpr = new BodyExpression(
      List([xVarExpr, yVarExpr]), NumberType,
      (xCompiledType, yCompiledType) => {
        assert.equals(xCompiledType.srcType, NumberType)
        assert.equals(yCompiledType.srcType, NumberType)

        return (x, y) => {
          return x+y
        }
      })

    const addLambda = new TermLambdaExpression(
      xVar, NumberType,
      new TermLambdaExpression(
        yVar, NumberType, addExpr))

    const compiledFunction = compileExpr(addLambda)

    assert.equals(compiledFunction.call(1, 2), 3)

    assert.throws(() => compiledFunction.call('foo', 'bar'))

    assert.end()
  })
})

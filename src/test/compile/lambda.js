import test from 'tape'

import {
  TermVariable
} from 'lib/core'

import {
  VariableExpression,
  TermLambdaExpression,
  compileExpr
} from 'lib/expr'

import { NumberType } from '../util'

test('expression compilation test', assert => {
  assert.test('lambda expression', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const varExpr = new VariableExpression(xVar, NumberType)

    const xLambda = new TermLambdaExpression(
      xVar, NumberType, varExpr)

    const func1 = compileExpr(xLambda)
    assert.equals(func1.call(2), 2)

    const yxLambda = new TermLambdaExpression(
      yVar, NumberType, xLambda)

    assert.throws(() => yxLambda.call('foo', 'bar'),
      'should type check arguments before calling compiled function')

    assert.throws(() => yxLambda.call(1),
      'should check argument size')

    assert.throws(() => yxLambda.call(1, 2, 3),
      'should check argument size')

    const func2 = compileExpr(yxLambda)
    assert.equals(func2.call(3, 4), 4)

    const yLambda = new TermLambdaExpression(
      yVar, NumberType, varExpr)

    assert.throws(() => compileExpr(yLambda),
      'should not able to compile expression with free variable')

    const xyLambda = new TermLambdaExpression(
      xVar, NumberType, yLambda)

    const func3 = compileExpr(xyLambda)
    assert.equals(func3.call(1, 2), 1)

    const xyxLambda = new TermLambdaExpression(
      xVar, NumberType, yxLambda)

    const func4 = compileExpr(xyxLambda)

    assert.equals(func4.call(2, 3, 4), 4)

    assert.end()
  })
})

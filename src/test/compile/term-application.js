import test from 'tape'

import {
  TermVariable, List
} from 'lib/core'

import {
  ValueExpression,
  BodyExpression,
  VariableExpression,
  TermLambdaExpression,
  TermApplicationExpression,
  compileExpr
} from 'lib/expr'

import { NumberType } from '../util'

test('expression compilation test', assert => {
  assert.test('term application test', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const zVar = new TermVariable('z')

    const addExpr = new BodyExpression(
      List([
        new VariableExpression(xVar, NumberType),
        new VariableExpression(yVar, NumberType)
      ]),
      NumberType,
      (xCompiledType, yCompiledType) =>
        (x, y) => x+y)

    const addLambda = new TermLambdaExpression(
      xVar, NumberType,
      new TermLambdaExpression(
        yVar, NumberType, addExpr))

    const addFiveLambda = new TermLambdaExpression(
      zVar, NumberType,
      new TermApplicationExpression(
        new TermApplicationExpression(addLambda,
          new VariableExpression(zVar, NumberType)),
        new ValueExpression(5, NumberType)))

    const compiledFunction = compileExpr(addFiveLambda)

    assert.equals(compiledFunction.call(2), 7)

    assert.end()
  })

  assert.test('partial application', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const zVar = new TermVariable('z')

    const addExpr = new BodyExpression(
      List([
        new VariableExpression(xVar, NumberType),
        new VariableExpression(yVar, NumberType)
      ]),
      NumberType,
      (xCompiledType, yCompiledType) =>
        (x, y) => x+y)

    const addLambda = new TermLambdaExpression(
      xVar, NumberType,
      new TermLambdaExpression(
        yVar, NumberType, addExpr))

    const adderLambda = new TermLambdaExpression(
      zVar, NumberType,
      new TermApplicationExpression(addLambda,
        new VariableExpression(zVar, NumberType)))

    const compiledAdder = compileExpr(adderLambda)

    const fiveAdder = compiledAdder.func(5)

    assert.equals(fiveAdder.call(2), 7)
    assert.equals(fiveAdder.call(1), 6)
    assert.equals(fiveAdder.call(-2), 3)

    assert.throws(() => fiveAdder.call('foo'))
    assert.throws(() => fiveAdder.call(2, 3))

    assert.end()
  })
})

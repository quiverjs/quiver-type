import test from 'tape'

import {
  TermVariable, Set, List
} from 'lib/core'

import {
  compileExpr,
  ValueExpression,
  RawBodyExpression,
  VariableExpression,
  TermLambdaExpression,
  TermApplicationExpression
} from 'lib/expr'

import { ArrowType } from 'lib/type'

import {
  equals, equalsType,
  NumberType, StringType
} from './util'

test('term lambda test', assert => {
  assert.test('identity test', assert => {
    const xVar = new TermVariable('x')

    const idNumExpr = new RawBodyExpression(
      List([new VariableExpression(xVar, NumberType)]),
      NumberType,
      x => x)

    // idNum :: Number -> Number
    // idNum = \x :: Number -> x
    const idNumLambda = new TermLambdaExpression(
      xVar, NumberType, idNumExpr)

    assert::equals(idNumLambda.freeTermVariables(), Set())

    assert.equal(
      idNumLambda.bindTerm(xVar, new ValueExpression(1, NumberType)),
      idNumLambda,
      'should not affect binding inside lambda')

    const argExpr = new ValueExpression(3, NumberType)

    const appliedExpr = new TermApplicationExpression(
      idNumLambda, argExpr)

    // should not affect binding inside lambda
    assert.equal(
      appliedExpr.bindTerm(xVar, new ValueExpression(5, NumberType)),
      appliedExpr,
      'should not affect binding inside lambda')

    assert::equals(appliedExpr.freeTermVariables(), Set())

    const resultExpr = appliedExpr.evaluate()
    assert.equal(resultExpr, argExpr)
    assert.equal(resultExpr.value, 3)

    const stringArg = new ValueExpression('foo', StringType)

    assert.throws(() => {
      new TermApplicationExpression(idNumLambda, stringArg)
    }, 'type check should reject accept string argument')

    assert.throws(() => {
      new TermApplicationExpression(idNumLambda, idNumLambda)
    }, 'type check should reject accept lambda argument')

    assert.end()
  })

  assert.test('ignored variable lambda', assert => {
    const xVar = new TermVariable('x')

    const constantExpr = new ValueExpression('foo', StringType)

    const constantLambda = new TermLambdaExpression(
      xVar, NumberType, constantExpr)

    const argExpr = new ValueExpression(8, NumberType)

    const appliedExpr = new TermApplicationExpression(
      constantLambda, argExpr)

    const resultExpr = appliedExpr.evaluate()
    assert.equal(resultExpr, constantExpr)
    assert.equal(resultExpr.value, 'foo')

    assert.end()
  })

  assert.test('two variables lambda', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const plusExpr = new RawBodyExpression(
      List([
        new VariableExpression(xVar, NumberType),
        new VariableExpression(yVar, NumberType)
      ]),
      NumberType,
      (xExpr, yExpr) => {
        const result = xExpr.value + yExpr.value
        return new ValueExpression(result, NumberType)
      })

    const yPlusLambda = new TermLambdaExpression(
      yVar, NumberType, plusExpr)

    assert::equals(yPlusLambda.freeTermVariables(), Set([xVar]))

    const plusLambda = new TermLambdaExpression(
      xVar, NumberType, yPlusLambda)

    assert::equals(plusLambda.freeTermVariables(), Set())

    const plusType = new ArrowType(NumberType, new ArrowType(NumberType, NumberType))
    assert::equalsType(plusLambda, plusType)

    const arg1 = new ValueExpression(2, NumberType)
    const plusTwoLambda = new TermApplicationExpression(
      plusLambda, arg1
    ).evaluate()

    const plusTwoType = new ArrowType(NumberType, NumberType)
    assert::equalsType(plusTwoLambda, plusTwoType)

    const arg2 = new ValueExpression(3, NumberType)
    const result1 = new TermApplicationExpression(
      plusTwoLambda, arg2
    ).evaluate()

    assert.equal(result1.value, 5)

    const arg3 = new ValueExpression(4, NumberType)
    const result2 = new TermApplicationExpression(
      plusTwoLambda, arg3
    ).evaluate()

    assert.equal(result2.value, 6)

    assert.end()
  })

  assert.test('lambda compilation', assert => {
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

import test from 'tape'

import {
  TermVariable, Set, List, TypeEnv
} from '../lib/core'

import {
  ValueExpression,
  BodyExpression,
  TypedVariableExpression,
  TermLambdaExpression,
  TermApplicationExpression
} from '../lib/expr'

import {
  LiteralType, ArrowType
} from '../lib/type'

import {
  assertNumber, assertString, equals, equalsType
} from './util'

test('term lambda test', assert => {
  const NumberType = new LiteralType(assertNumber)
  const StringType = new LiteralType(assertString)

  assert.test('identity test', assert => {
    const xVar = new TermVariable('x')

    const idNumExpr = new BodyExpression(
      List([new TypedVariableExpression(xVar, NumberType)]),
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

    assert.throws(() => {
      new TermLambdaExpression(xVar, StringType, idNumExpr)
    }, 'function expr should type check lambda bound arg type')

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

    const plusExpr = new BodyExpression(
      List([
        new TypedVariableExpression(xVar, NumberType),
        new TypedVariableExpression(yVar, NumberType)
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
})

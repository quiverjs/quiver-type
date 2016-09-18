import test from 'tape'

import {
  TermVariable, Set, List
} from '../lib/core'

import {
  ValueExpression,
  FunctionExpression,
  TypedVariableExpression,
  TermLambdaExpression,
  TermApplicationExpression
} from '../lib/expr'

import {
  LiteralType
} from '../lib/type'

const assertNumber = num => {
  if(typeof(num) !== 'number')
    throw new TypeError('argument must be number')
}

const assertString = str => {
  if(typeof(str) !== 'string')
    throw new TypeError('argument must be string')
}

const equals = function(result, expected, message) {
  return this.ok(result.equals(expected), message)
}

test('term lambda test', assert => {
  const NumberType = new LiteralType(assertNumber)
  const StringType = new LiteralType(assertString)

  assert.test('identity test', assert => {
    const xVar = new TermVariable('x')

    const idNumExpr = new FunctionExpression(
      List([new TypedVariableExpression(xVar, NumberType)]),
      NumberType,
      x => x)

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
})

import test from 'tape'

import {
  TermVariable, Set, List
} from '../lib/core'

import {
  ValueExpression,
  VariableExpression,
  BodyExpression
} from '../lib/expr'

import {
  LiteralType
} from '../lib/type'

import {
  assertNumber, assertString, equals
} from './util'

test('primitive type test', assert => {
  assert.test('value expr', assert => {
    const NumberType = new LiteralType(assertNumber)
    const StringType = new LiteralType(assertString)

    const valueExpr = new ValueExpression(8, NumberType)

    assert.equal(valueExpr.exprType(), NumberType)
    assert.equal(valueExpr.evaluate(), valueExpr)
    assert.equal(valueExpr.value, 8)

    assert.throws(() => {
      new ValueExpression('foo', NumberType)
    })

    const x = new TermVariable('x')
    const y = new TermVariable('y')

    const varExpr = new VariableExpression(x, NumberType)

    assert.ok(varExpr.freeTermVariables().equals(Set([x])))

    assert.equal(varExpr.exprType(), NumberType)

    assert.equal(varExpr.evaluate(), varExpr)
    assert.equal(varExpr.bindTerm(y, valueExpr), varExpr)

    const x2 = new TermVariable('x')
    assert.equal(varExpr.bindTerm(x2, valueExpr), varExpr,
      'term variable of same name but different instance should be distinguish')

    const varExpr2 = varExpr.bindTerm(x, valueExpr)
    assert.notEqual(varExpr2, varExpr)
    assert.equal(varExpr2, valueExpr)

    assert.end()
  })

  assert.test('function expr', assert => {
    const NumberType = new LiteralType(assertNumber)
    const StringType = new LiteralType(assertString)

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const argExprs = List([
      new VariableExpression(xVar, NumberType),
      new VariableExpression(yVar, NumberType)
    ])

    const doPlus = (xExpr, yExpr) => {
      const x = xExpr.value
      const y = yExpr.value

      assert.equal(x, 3)
      assert.equal(y, 2)

      const result = x+y
      return new ValueExpression(result, NumberType)
    }

    const plusExpr = new BodyExpression(
      argExprs, NumberType, doPlus)

    assert::equals(plusExpr.freeTermVariables(),
      Set([xVar, yVar]))

    assert.equals(plusExpr.evaluate(), plusExpr)

    const xArg = new ValueExpression(3, NumberType)

    const plusExpr2 = plusExpr.bindTerm(xVar, xArg)

    assert.notEqual(plusExpr2, plusExpr)

    assert::equals(plusExpr.freeTermVariables(),
      Set([xVar, yVar]),
      'original expression should not be modified')

    assert::equals(plusExpr2.freeTermVariables(),
      Set([yVar]),
      'new expression should only have y not bounded')

    assert.equals(plusExpr2.evaluate(), plusExpr2)

    assert.throws(() => {
      const arg = new ValueExpression('foo', StringType)
      plusExpr2.bindTerm(yVar, arg)
    })

    const yArg = new ValueExpression(2, NumberType)

    const plusExpr3 = plusExpr2.bindTerm(yVar, yArg)

    assert::equals(plusExpr3.freeTermVariables(),
      Set(),
      'new expression should have all variables bounded')

    const resultExpr = plusExpr3.evaluate()

    assert.ok(resultExpr instanceof ValueExpression)
    assert.equal(resultExpr.value, 5)

    assert.end()
  })
})

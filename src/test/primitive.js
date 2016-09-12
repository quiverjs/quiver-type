import test from 'tape'

import {
  TermVariable, TypeEnv, Set
} from '../lib/core'

import {
  ValueExpression,
  VariableExpression,
  FunctionExpression
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

    const varExpr = new VariableExpression(x)

    assert.ok(varExpr.freeTermVariables().equals(Set([x])))

    const typeEnv = new TypeEnv()

    assert.throws(() => {
      varExpr.exprType(typeEnv)
    })

    const typeEnv2 = typeEnv
      .set(x, NumberType)

    assert.equal(varExpr.exprType(typeEnv2), NumberType)

    assert.equal(varExpr.evaluate(), varExpr)
    assert.equal(varExpr.bindTerm(y, valueExpr), varExpr)

    const varExpr2 = varExpr.bindTerm(x, valueExpr)
    assert.notEqual(varExpr2, varExpr)
    assert.equal(varExpr2, valueExpr)

    assert.end()
  })

  assert.test('function expr', assert => {

    assert.end()
  })
})

import test from 'tape'

import {
  TermVariable, TypeVariable
} from 'lib/core'

import {
  VariableExpression,
  TermLambdaExpression,
  TypeLambdaExpression,
  compileExpr
} from 'lib/expr'

import {
  ArrowType,
  VariableType,
  ForAllType
} from 'lib/type'

import {
  typeKind
} from 'lib/kind'

import {
  NumberType, StringType
} from '../util'

test('type lambda test', assert => {
  assert.test('identity test', assert => {
    const xVar = new TermVariable('x')
    const aTVar = new TypeVariable('a')

    const aType = new VariableType(aTVar, typeKind)
    assert.throws(() => aType.compileType())

    assert.equals(aType.bindType(aTVar, NumberType), NumberType)

    const idExpr = new VariableExpression(xVar, aType)

    assert.equals(idExpr.exprType(), aType)

    const idLambda = new TermLambdaExpression(
      xVar, aType, idExpr)

    const idLambdaType = idLambda.exprType()

    assert.ok(idLambdaType instanceof ArrowType)
    assert.equals(idLambdaType.leftType, aType)
    assert.equals(idLambdaType.rightType, aType)

    assert.throws(() => compileExpr(idLambdaType))

    const typeLambda = new TypeLambdaExpression(
      aTVar, typeKind, idLambda)

    const tLambdaType = typeLambda.exprType()
    assert.ok(tLambdaType instanceof ForAllType)

    assert.end()
  })
})

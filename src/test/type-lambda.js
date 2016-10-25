import test from 'tape'

import {
  TermVariable, TypeVariable
} from 'lib/core'

import {
  compileExpr,
  VariableExpression,
  TermLambdaExpression,
  TypeLambdaExpression,
  TypeApplicationExpression
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
} from './util'

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

    typeLambda.exprType().typeCheck(
      new ForAllType(aTVar, typeKind,
        new ArrowType(aType, aType)
      ))

    assert.ok(typeLambda.exprType() instanceof ForAllType)

    const numTypeApp = new TypeApplicationExpression(
      typeLambda, NumberType)

    numTypeApp.exprType().typeCheck(
      new ArrowType(NumberType, NumberType))

    const numIdLambda = numTypeApp.evaluate()
    numIdLambda.exprType().typeCheck(
      new ArrowType(NumberType, NumberType))

    assert.ok(numIdLambda instanceof TermLambdaExpression)

    const numIdFunc = compileExpr(numIdLambda)
    assert.equals(numIdFunc.call(8), 8)

    assert.throws(() => numIdFunc.call('foo'))

    const bTVar = new TypeVariable('b')
    const bType = new VariableType(bTVar, typeKind)

    const bTypeApp = new TypeApplicationExpression(
      typeLambda, bType)

    bTypeApp.exprType().typeCheck(new ArrowType(bType, bType))

    assert.equals(bTypeApp.evaluate(), bTypeApp,
      'type application applied to non terminal type should not be evaluated')

    const stringTypeApp = new TypeApplicationExpression(
      new TypeLambdaExpression(bTVar, typeKind, bTypeApp),
      StringType)

    stringTypeApp.exprType().typeCheck(
      new ArrowType(StringType, StringType))

    const stringIdLambda = stringTypeApp.evaluate()
    assert.ok(stringIdLambda instanceof TermLambdaExpression)

    const stringIdFunc = compileExpr(stringIdLambda)

    assert.equals(stringIdFunc.call('foo'), 'foo')
    assert.throws(() => stringIdFunc.call(9))

    assert.end()
  })
})

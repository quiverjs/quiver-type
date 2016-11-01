import test from 'tape'

import {
  TermVariable, TypeVariable
} from '../lib/core'

import {
  VariableExpression,
  TermLambdaExpression,
  TypeLambdaExpression,
  TermApplicationExpression,
  TypeApplicationExpression
} from '../lib/expr'

import {
  ArrowType,
  VariableType,
  ForAllType
} from '../lib/type'

import {
  unitKind, ArrowKind
} from '../lib/kind'

import { compileExpr } from '../lib/util'

import {
  NumberType, StringType, exprTypeEquals, typeKindEquals
} from './util'

test('type lambda test', assert => {
  assert.test('identity test', assert => {
    const xVar = new TermVariable('x')
    const aTVar = new TypeVariable('a')

    const aType = new VariableType(aTVar, unitKind)
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
      aTVar, unitKind, idLambda)

    assert::exprTypeEquals(typeLambda,
      new ForAllType(aTVar, unitKind,
        new ArrowType(aType, aType)))

    assert.ok(typeLambda.exprType() instanceof ForAllType)

    const numTypeApp = new TypeApplicationExpression(
      typeLambda, NumberType)

    assert::exprTypeEquals(numTypeApp,
      new ArrowType(NumberType, NumberType))

    const numIdLambda = numTypeApp.evaluate()
    assert::exprTypeEquals(numIdLambda,
      new ArrowType(NumberType, NumberType))

    assert.ok(numIdLambda instanceof TermLambdaExpression)

    const numIdFunc = compileExpr(numIdLambda)
    assert.equals(numIdFunc.call(8), 8)

    assert.throws(() => numIdFunc.call('foo'))

    const bTVar = new TypeVariable('b')
    const bType = new VariableType(bTVar, unitKind)

    const bTypeApp = new TypeApplicationExpression(
      typeLambda, bType)

    assert::exprTypeEquals(bTypeApp, new ArrowType(bType, bType))

    assert.equals(bTypeApp.evaluate(), bTypeApp,
      'type application applied to non terminal type should not be evaluated')

    const stringTypeApp = new TypeApplicationExpression(
      new TypeLambdaExpression(bTVar, unitKind, bTypeApp),
      StringType)

    assert::exprTypeEquals(stringTypeApp,
      new ArrowType(StringType, StringType))

    const stringIdLambda = stringTypeApp.evaluate()
    assert.ok(stringIdLambda instanceof TermLambdaExpression)

    const stringIdFunc = compileExpr(stringIdLambda)

    assert.equals(stringIdFunc.call('foo'), 'foo')
    assert.throws(() => stringIdFunc.call(9))

    assert.end()
  })

  assert.test('kinded type lambda test', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const zVar = new TermVariable('z')

    const aTVar = new TypeVariable('a')
    const bTVar = new TypeVariable('b')
    const cTVar = new TypeVariable('c')
    const dTVar = new TypeVariable('d')

    const aType = new VariableType(aTVar, unitKind)
    const bType = new VariableType(bTVar, unitKind)

    assert.ok(new TypeLambdaExpression(aTVar, unitKind,
      new VariableExpression(xVar,
        new VariableType(aTVar, unitKind))))

    assert.throws(() =>
      new TypeLambdaExpression(aTVar, unitKind,
        new VariableExpression(xVar,
          new VariableType(aTVar,
            new ArrowKind(unitKind, unitKind)))),
      'should not construct if type variable have mismatch kind in body')

    // first = forall a b . lambda x: a, y: b . x
    const polyFirst = new TypeLambdaExpression(aTVar, unitKind,
      new TypeLambdaExpression(bTVar, unitKind,
        new TermLambdaExpression(xVar, aType,
          new TermLambdaExpression(yVar, bType,
            new VariableExpression(xVar, aType)))))

    // first :: forall a b . a -> b -> a
    assert::exprTypeEquals(polyFirst,
      new ForAllType(aTVar, unitKind,
        new ForAllType(bTVar, unitKind,
          new ArrowType(aType,
            new ArrowType(bType, aType)))))

    // * -> * -> *
    const twoArrowKind = new ArrowKind(unitKind,
      new ArrowKind(unitKind, unitKind))

    // first ::: * -> * -> *
    assert::typeKindEquals(polyFirst.exprType(), twoArrowKind)

    const firstNumStr = new TypeApplicationExpression(
      new TypeApplicationExpression(
        polyFirst, NumberType),
      StringType)

    assert::exprTypeEquals(firstNumStr, new ArrowType(
      NumberType, new ArrowType(StringType, NumberType)))

    const firstNumFunc = compileExpr(firstNumStr.evaluate())

    assert.equals(firstNumFunc.call(1, 'foo'), 1)
    assert.throws(() => firstNumFunc.call('foo', 1))
    assert.throws(() => firstNumFunc.call(1, 2))

    const cType = new VariableType(cTVar, twoArrowKind)
    const dType = new VariableType(dTVar, unitKind)

    // sameType = TLambda c :: * -> * -> * .
    //               lambda z : c .
    //                  TLambda d :: * .
    //                      z [d] [d]
    const sameTypeLambda = new TypeLambdaExpression(
      cTVar, twoArrowKind,
      new TermLambdaExpression(
        zVar, cType,
        new TypeLambdaExpression(
          dTVar, unitKind,
          new TypeApplicationExpression(
            new TypeApplicationExpression(
              new VariableExpression(
                zVar, cType),
              dType),
            dType))))

    // true :: a -> a -> a
    // true = sameType [forall a b . a] first
    const polyTrue = new TermApplicationExpression(
      new TypeApplicationExpression(
        sameTypeLambda,
        polyFirst.exprType()),
      polyFirst)
      .evaluate()

    assert.ok(polyTrue instanceof TypeLambdaExpression)
    assert::exprTypeEquals(polyTrue, new ForAllType(
      dTVar, unitKind,
      new ArrowType(dType, new ArrowType(dType, dType))))

    const numTrue = new TypeApplicationExpression(
      polyTrue, NumberType)
      .evaluate()

    assert.ok(numTrue instanceof TermLambdaExpression)
    assert::exprTypeEquals(numTrue, new ArrowType(
      NumberType, new ArrowType(NumberType, NumberType)))

    const trueFn = compileExpr(numTrue)
    assert.equals(trueFn.call(1, 2), 1)

    assert.end()
  })
})

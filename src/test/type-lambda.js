import test from 'tape'

import {
  TermVariable, TypeVariable
} from 'lib/core'

import {
  compileExpr,
  VariableExpression,
  TermLambdaExpression,
  TypeLambdaExpression,
  TermApplicationExpression,
  TypeApplicationExpression
} from 'lib/expr'

import {
  ArrowType,
  VariableType,
  ForAllType
} from 'lib/type'

import {
  typeKind, ArrowKind
} from 'lib/kind'

import {
  NumberType, StringType, exprTypeEquals, typeKindEquals
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

    assert::exprTypeEquals(typeLambda,
      new ForAllType(aTVar, typeKind,
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
    const bType = new VariableType(bTVar, typeKind)

    const bTypeApp = new TypeApplicationExpression(
      typeLambda, bType)

    assert::exprTypeEquals(bTypeApp, new ArrowType(bType, bType))

    assert.equals(bTypeApp.evaluate(), bTypeApp,
      'type application applied to non terminal type should not be evaluated')

    const stringTypeApp = new TypeApplicationExpression(
      new TypeLambdaExpression(bTVar, typeKind, bTypeApp),
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

    const aType = new VariableType(aTVar, typeKind)
    const bType = new VariableType(bTVar, typeKind)

    assert.ok(new TypeLambdaExpression(aTVar, typeKind,
      new VariableExpression(xVar,
        new VariableType(aTVar, typeKind))))

    assert.throws(() =>
      new TypeLambdaExpression(aTVar, typeKind,
        new VariableExpression(xVar,
          new VariableType(aTVar,
            new ArrowKind(typeKind, typeKind)))),
      'should not construct if type variable have mismatch kind in body')

    // first = forall a b . lambda x: a, y: b . x
    const polyFirst = new TypeLambdaExpression(aTVar, typeKind,
      new TypeLambdaExpression(bTVar, typeKind,
        new TermLambdaExpression(xVar, aType,
          new TermLambdaExpression(yVar, bType,
            new VariableExpression(xVar, aType)))))

    // first :: forall a b . a -> b -> a
    assert::exprTypeEquals(polyFirst,
      new ForAllType(aTVar, typeKind,
        new ForAllType(bTVar, typeKind,
          new ArrowType(aType,
            new ArrowType(bType, aType)))))

    // * -> * -> *
    const twoArrowKind = new ArrowKind(typeKind,
      new ArrowKind(typeKind, typeKind))

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

    // second = forall a b . lambda x: a, y: b . y
    const polySecond = new TypeLambdaExpression(
      aTVar, typeKind,
      new TypeLambdaExpression(
        bTVar, typeKind,
        new TermLambdaExpression(
          xVar, new VariableType(aTVar, typeKind),
          new TermLambdaExpression(
            yVar, new VariableType(bTVar, typeKind),
            new VariableExpression(yVar, bType)))))

    const cType = new VariableType(cTVar, twoArrowKind)
    const dType = new VariableType(dTVar, typeKind)

    // sameType = TLambda c :: * -> * -> *, d :: * .
    //               lambda z : c .
    //                  z [d] [d]
    const sameTypeLambda = new TypeLambdaExpression(
      cTVar, twoArrowKind,
      new TypeLambdaExpression(
        dTVar, typeKind,
        new TermLambdaExpression(
          zVar, cType,
          new TypeApplicationExpression(
            new TypeApplicationExpression(
              new VariableExpression(
                zVar, cType),
              dType),
            dType))))

    // const apply1 = new TypeApplicationExpression(
    //   sameTypeLambda,
    //   polyFirst.exprType())
    //
    // console.log(apply1)

    // const polyTrue = new TermApplicationExpression(
    //   new TypeApplicationExpression(
    //     new TypeApplicationExpression(
    //       sameTypeLambda,
    //       polyFirst.exprType()),
    //     NumberType),
    //   polyFirst)

    assert.end()
  })
})

import test from 'tape'

import {
  TermVariable, TypeVariable
} from '../lib/core'

import {
  VariableTerm,
  TermLambdaTerm,
  TypeLambdaTerm,
  TermApplicationTerm,
  TypeApplicationTerm
} from '../lib/term'

import {
  ArrowType,
  VariableType,
  ForAllType
} from '../lib/type'

import {
  unitKind, ArrowKind
} from '../lib/kind'

import { compileTerm } from '../lib/util'

import {
  NumberType, StringType, termTypeEquals, typeKindEquals
} from './util'

test('type lambda test', assert => {
  assert.test('identity test', assert => {
    const xVar = new TermVariable('x')
    const aTVar = new TypeVariable('a')

    const aType = new VariableType(aTVar, unitKind)
    assert.throws(() => aType.compileType())

    assert.equals(aType.bindType(aTVar, NumberType), NumberType)

    const idTerm = new VariableTerm(xVar, aType)

    assert.equals(idTerm.termType(), aType)

    const idLambda = new TermLambdaTerm(
      xVar, aType, idTerm)

    const idLambdaType = idLambda.termType()

    assert.ok(idLambdaType instanceof ArrowType)
    assert.equals(idLambdaType.leftType, aType)
    assert.equals(idLambdaType.rightType, aType)

    assert.throws(() => compileTerm(idLambdaType))

    const typeLambda = new TypeLambdaTerm(
      aTVar, unitKind, idLambda)

    assert::termTypeEquals(typeLambda,
      new ForAllType(aTVar, unitKind,
        new ArrowType(aType, aType)))

    assert.ok(typeLambda.termType() instanceof ForAllType)

    const numTypeApp = new TypeApplicationTerm(
      typeLambda, NumberType)

    assert::termTypeEquals(numTypeApp,
      new ArrowType(NumberType, NumberType))

    const numIdLambda = numTypeApp.evaluate()
    assert::termTypeEquals(numIdLambda,
      new ArrowType(NumberType, NumberType))

    assert.ok(numIdLambda instanceof TermLambdaTerm)

    const numIdFunc = compileTerm(numIdLambda)
    assert.equals(numIdFunc.call(8), 8)

    assert.throws(() => numIdFunc.call('foo'))

    const bTVar = new TypeVariable('b')
    const bType = new VariableType(bTVar, unitKind)

    const bTypeApp = new TypeApplicationTerm(
      typeLambda, bType)

    assert::termTypeEquals(bTypeApp, new ArrowType(bType, bType))

    assert.equals(bTypeApp.evaluate(), bTypeApp,
      'type application applied to non terminal type should not be evaluated')

    const stringTypeApp = new TypeApplicationTerm(
      new TypeLambdaTerm(bTVar, unitKind, bTypeApp),
      StringType)

    assert::termTypeEquals(stringTypeApp,
      new ArrowType(StringType, StringType))

    const stringIdLambda = stringTypeApp.evaluate()
    assert.ok(stringIdLambda instanceof TermLambdaTerm)

    const stringIdFunc = compileTerm(stringIdLambda)

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

    assert.ok(new TypeLambdaTerm(aTVar, unitKind,
      new VariableTerm(xVar,
        new VariableType(aTVar, unitKind))))

    assert.throws(() =>
      new TypeLambdaTerm(aTVar, unitKind,
        new VariableTerm(xVar,
          new VariableType(aTVar,
            new ArrowKind(unitKind, unitKind)))),
      'should not construct if type variable have mismatch kind in body')

    // first = forall a b . lambda x: a, y: b . x
    const polyFirst = new TypeLambdaTerm(aTVar, unitKind,
      new TypeLambdaTerm(bTVar, unitKind,
        new TermLambdaTerm(xVar, aType,
          new TermLambdaTerm(yVar, bType,
            new VariableTerm(xVar, aType)))))

    // first :: forall a b . a -> b -> a
    assert::termTypeEquals(polyFirst,
      new ForAllType(aTVar, unitKind,
        new ForAllType(bTVar, unitKind,
          new ArrowType(aType,
            new ArrowType(bType, aType)))))

    // * -> * -> *
    const twoArrowKind = new ArrowKind(unitKind,
      new ArrowKind(unitKind, unitKind))

    // first ::: * -> * -> *
    assert::typeKindEquals(polyFirst.termType(), twoArrowKind)

    const firstNumStr = new TypeApplicationTerm(
      new TypeApplicationTerm(
        polyFirst, NumberType),
      StringType)

    assert::termTypeEquals(firstNumStr, new ArrowType(
      NumberType, new ArrowType(StringType, NumberType)))

    const firstNumFunc = compileTerm(firstNumStr.evaluate())

    assert.equals(firstNumFunc.call(1, 'foo'), 1)
    assert.throws(() => firstNumFunc.call('foo', 1))
    assert.throws(() => firstNumFunc.call(1, 2))

    const cType = new VariableType(cTVar, twoArrowKind)
    const dType = new VariableType(dTVar, unitKind)

    // sameType = TLambda c :: * -> * -> * .
    //               lambda z : c .
    //                  TLambda d :: * .
    //                      z [d] [d]
    const sameTypeLambda = new TypeLambdaTerm(
      cTVar, twoArrowKind,
      new TermLambdaTerm(
        zVar, cType,
        new TypeLambdaTerm(
          dTVar, unitKind,
          new TypeApplicationTerm(
            new TypeApplicationTerm(
              new VariableTerm(
                zVar, cType),
              dType),
            dType))))

    // true :: a -> a -> a
    // true = sameType [forall a b . a] first
    const polyTrue = new TermApplicationTerm(
      new TypeApplicationTerm(
        sameTypeLambda,
        polyFirst.termType()),
      polyFirst)
      .evaluate()

    assert.ok(polyTrue instanceof TypeLambdaTerm)
    assert::termTypeEquals(polyTrue, new ForAllType(
      dTVar, unitKind,
      new ArrowType(dType, new ArrowType(dType, dType))))

    const numTrue = new TypeApplicationTerm(
      polyTrue, NumberType)
      .evaluate()

    assert.ok(numTrue instanceof TermLambdaTerm)
    assert::termTypeEquals(numTrue, new ArrowType(
      NumberType, new ArrowType(NumberType, NumberType)))

    const trueFn = compileTerm(numTrue)
    assert.equals(trueFn.call(1, 2), 1)

    assert.end()
  })
})

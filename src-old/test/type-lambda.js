import test from 'tape'

import {
  termVar, typeVar,
  varTerm, termLambda,
  typeLambda, lambda,
  apply, applyType,
  arrow, varType, forall,
  unitKind, arrowKind,
  compile
} from '../lib/dsl'

import {
  ValueLambdaTerm,
  TypeLambdaTerm
} from '../lib/term'

import {
  ArrowType,
  ForAllType,
} from '../lib/type'

import { NumberType, StringType } from '../lib/prelude'

import { termTypeEquals, typeKindEquals } from './util'

test('type lambda test', assert => {
  assert.test('identity test', assert => {
    const xVar = termVar('x')
    const aTVar = typeVar('a')

    const aType = varType(aTVar, unitKind)
    assert.throws(() => aType.compileType())

    assert.equals(aType.bindType(aTVar, NumberType), NumberType)

    const idTerm = varTerm(xVar, aType)

    assert.equals(idTerm.termType(), aType)

    const idLambda = lambda(
      [[xVar, aType]],
      idTerm)

    const idLambdaType = idLambda.termType()

    assert.ok(idLambdaType instanceof ArrowType)
    assert.equals(idLambdaType.leftType, aType)
    assert.equals(idLambdaType.rightType, aType)

    assert.throws(() => compile(idLambdaType))

    const typeLambdaTerm = typeLambda(
      [[aTVar, unitKind]],
      idLambda)

    assert::termTypeEquals(typeLambdaTerm,
      forall(
        [[aTVar, unitKind]],
        arrow(aType, aType)))

    assert.ok(typeLambdaTerm.termType() instanceof ForAllType)

    const numTypeApp = applyType(
      typeLambdaTerm, NumberType)

    assert::termTypeEquals(numTypeApp,
      arrow(NumberType, NumberType))

    const numIdLambda = numTypeApp.evaluate()
    assert::termTypeEquals(numIdLambda,
      arrow(NumberType, NumberType))

    assert.ok(numIdLambda instanceof ValueLambdaTerm)

    const numIdFunc = compile(numIdLambda)
    assert.equals(numIdFunc.call(8), 8)

    assert.throws(() => numIdFunc.call('foo'))

    const bTVar = typeVar('b')
    const bType = varType(bTVar, unitKind)

    const bTypeApp = applyType(
      typeLambdaTerm, bType)

    assert::termTypeEquals(bTypeApp, arrow(bType, bType))

    assert.equals(bTypeApp.evaluate(), bTypeApp,
      'type application applied to non terminal type should not be evaluated')

    const stringTypeApp = applyType(
      typeLambda(
        [[bTVar, unitKind]],
        bTypeApp),
      StringType)

    assert::termTypeEquals(stringTypeApp,
      arrow(StringType, StringType))

    const stringIdLambda = stringTypeApp.evaluate()
    assert.ok(stringIdLambda instanceof ValueLambdaTerm)

    const stringIdFunc = compile(stringIdLambda)

    assert.equals(stringIdFunc.call('foo'), 'foo')
    assert.throws(() => stringIdFunc.call(9))

    assert.end()
  })

  assert.test('kinded type lambda test', assert => {
    const xVar = termVar('x')
    const yVar = termVar('y')
    const zVar = termVar('z')

    const aTVar = typeVar('a')
    const bTVar = typeVar('b')
    const cTVar = typeVar('c')
    const dTVar = typeVar('d')

    const aType = varType(aTVar, unitKind)
    const bType = varType(bTVar, unitKind)

    assert.ok(typeLambda(
      [[aTVar, unitKind]],
      varTerm(xVar,
        varType(aTVar, unitKind))))

    assert.throws(() =>
      typeLambda(
        [[aTVar, unitKind]],
        varTerm(xVar,
          varType(aTVar,
            arrowKind(unitKind, unitKind)))),
      'should not construct if type variable have mismatch kind in body')

    // first = forall a b . lambda x: a, y: b . x
    const polyFirst = typeLambda(
      [[aTVar, unitKind],
       [bTVar, unitKind]],
      lambda(
        [[xVar, aType],
         [yVar, bType]],
        varTerm(xVar, aType)))

    // first :: forall a b . a -> b -> a
    assert::termTypeEquals(polyFirst,
      forall(
        [[aTVar, unitKind],
         [bTVar, unitKind]],
          arrow(aType, bType, aType)))

    // * -> * -> *
    const twoArrowKind = arrowKind(unitKind, unitKind, unitKind)

    // first ::: * -> * -> *
    assert::typeKindEquals(polyFirst.termType(), twoArrowKind)

    const firstNumStr = applyType(
      polyFirst, NumberType, StringType)

    assert::termTypeEquals(firstNumStr,
      arrow(NumberType, StringType, NumberType))

    const firstNumFunc = compile(firstNumStr.evaluate())

    assert.equals(firstNumFunc.call(1, 'foo'), 1)
    assert.throws(() => firstNumFunc.call('foo', 1))
    assert.throws(() => firstNumFunc.call(1, 2))

    const cType = varType(cTVar, twoArrowKind)
    const dType = varType(dTVar, unitKind)

    // sameType = TLambda c :: * -> * -> * .
    //               lambda z : c .
    //                  TLambda d :: * .
    //                      z [d] [d]
    const sameTypeLambda = typeLambda(
      [[cTVar, twoArrowKind]],
      termLambda(
        [[zVar, cType]],
        typeLambda(
          [[dTVar, unitKind]],
          applyType(
            varTerm(
              zVar, cType),
            dType,
            dType))))

    // true :: forall a. a -> a -> a
    // true = sameType [forall a b . a] first
    const polyTrue = apply(
      applyType(
        sameTypeLambda,
        polyFirst.termType()),
      polyFirst)
      .evaluate()

    assert.ok(polyTrue instanceof TypeLambdaTerm)
    assert::termTypeEquals(polyTrue, forall(
      [[dTVar, unitKind]],
      arrow(dType, dType, dType)))

    const numTrue = applyType(
      polyTrue, NumberType)
      .evaluate()

    assert.ok(numTrue instanceof ValueLambdaTerm)
    assert::termTypeEquals(numTrue,
      arrow(NumberType, NumberType, NumberType))

    const trueFn = compile(numTrue)
    assert.equals(trueFn.call(1, 2), 1)

    assert.end()
  })
})

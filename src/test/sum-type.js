import test from 'tape'

import {
  Map, List,
  TermVariable, TypeVariable
} from '../lib/core'

import {
  BodyExpression,
  MatchExpression,
  ValueExpression,
  VariantExpression,
  VariableExpression,
  TermLambdaExpression
} from '../lib/expr'

import {
  VariableType,
  ForAllType,
  SumType,
  ApplicationType
} from '../lib/type'

import {
  unitKind, ArrowKind
} from '../lib/kind'

import {
  functionToExpression, compileExpr
} from '../lib/util'

import {
  NumberType, StringType, exprTypeEquals, typeKindEquals
} from './util'

test('sum type test', assert => {
  assert.test('basic sum type', assert => {
    const aTVar = new TypeVariable('a')
    const bTVar = new TypeVariable('b')

    const aType = new VariableType(aTVar, unitKind)
    const bType = new VariableType(bTVar, unitKind)

    // Either = forall a b. a | b
    const EitherType = new ForAllType(
      aTVar, unitKind,
      new ForAllType(
        bTVar, unitKind,
        new SumType(Map({
          Left: aType,
          Right: bType
        }))))

    // EitherNumStr = Number | String
    const EitherNumStr = new ApplicationType(
      new ApplicationType(
        EitherType, NumberType),
      StringType)

    const numVariantExpr = new VariantExpression(
      EitherNumStr, 'Left',
      new ValueExpression(3, NumberType))

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const matchLambda = new TermLambdaExpression(
      xVar, EitherNumStr,
      new MatchExpression(
        new VariableExpression(xVar, EitherNumStr),
        StringType,
        Map({
          Left: functionToExpression(
            List([NumberType]),
            StringType,
            x => `num(${x})`),
          Right: functionToExpression(
            List([StringType]),
            StringType,
            x => `str(${x})`)
        })))

    const matchNumExpr = matchLambda.applyExpr(numVariantExpr)
    assert.equals(compileExpr(matchNumExpr), 'num(3)')

    const compiledEitherNumStr = EitherNumStr.compileType()

    const matchFn = compileExpr(matchLambda)

    const numVariant = compileExpr(numVariantExpr)

    assert.equals(matchFn.call(numVariant), 'num(3)')

    const strVariant = compiledEitherNumStr.construct('Right', 'foo')

    assert.equals(matchFn.call(strVariant), 'str(foo)')

    assert.end()
  })

  assert.test('error sum types', assert => {
    assert.throws(() => {
      const invalidSumType = new SumType(Map({
        Left: NumberType,
        Right: new VariableType(
          new TypeVariable('a'),
          new ArrowKind(unitKind, unitKind))
      }))
    }, 'should not allow non unit kind in sum type member')

    const EitherNumStr = new SumType(Map({
      Left: NumberType,
      Right: StringType
    }))

    const xVar = new TermVariable('x')

    assert.throws(() => {
      const invalidMatch = new MatchExpression(
        new VariableExpression(xVar, EitherNumStr),
        StringType,
        Map({
          Left: functionToExpression(
            List([NumberType]),
            StringType,
            x => `num(${x})`)
        }))
    }, 'should not allow match expression that doesn\'t match all cases')

    assert.throws(() => {
      const invalidMatch = new MatchExpression(
        new VariableExpression(xVar, EitherNumStr),
        StringType,
        Map({
          foo: functionToExpression(
            List([NumberType]),
            StringType,
            x => `num(${x})`),
          bar: functionToExpression(
            List([StringType]),
            StringType,
            x => `str(${x})`)
        }))
    }, 'should not allow match expression that have wrong variant tags')

    assert.throws(() => {
      const invalidMatch = new MatchExpression(
        new VariableExpression(xVar, EitherNumStr),
        StringType,
        Map({
          Left: functionToExpression(
            List([StringType]),
            StringType,
            x => `num(${x})`),
          Right: functionToExpression(
            List([NumberType]),
            StringType,
            x => `str(${x})`)
        }))
    }, 'should not allow match expression with wrong lambda type in tag')

    assert.throws(() => {
      const invalidMatch = new MatchExpression(
        new VariableExpression(xVar, EitherNumStr),
        StringType,
        Map({
          Left: functionToExpression(
            List([NumberType]),
            StringType,
            x => `num(${x})`),
          Right: functionToExpression(
            List([StringType]),
            NumberType,
            x => `str(${x})`)
        }))
    }, 'should not allow match expression with mismatched return type')

    assert.throws(() => {
      const invalidMatch = new MatchExpression(
        new VariableExpression(xVar, EitherNumStr),
        StringType,
        Map({
          Left: functionToExpression(
            List([NumberType]),
            StringType,
            x => `num(${x})`),
          Right: new BodyExpression(
            List([
              new VariableExpression(xVar, NumberType),
            ]),
            StringType,
            () => x => `str(${x})`)
        }))
    }, 'should not allow match expression with non lambda expression case handler')

    assert.end()
  })
})

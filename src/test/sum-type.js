import test from 'tape'

import {
  Map, List,
  TermVariable, TypeVariable
} from '../lib/core'

import {
  MatchExpression,
  ValueExpression,
  VariantExpression,
  VariableExpression,
  TermLambdaExpression,
  TypeLambdaExpression,
  TermApplicationExpression,
  TypeApplicationExpression
} from '../lib/expr'

import {
  ArrowType,
  VariableType,
  ForAllType,
  SumType,
  ApplicationType
} from '../lib/type'

import {
  unitKind
} from '../lib/kind'

import {
  wrapFunction, compileExpr
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
          Left: wrapFunction(
            x => `num(${x})`,
            List([NumberType]),
            StringType)
            .srcExpr,
          Right: wrapFunction(
            x => `str(${x})`,
            List([StringType]),
            StringType)
            .srcExpr
        })))

    const matchNumExpr = matchLambda.applyExpr(numVariantExpr)

    const compiledEitherNumStr = EitherNumStr.compileType()

    const matchFn = compileExpr(matchLambda)

    const numVariant = compileExpr(numVariantExpr)

    assert.equals(matchFn.call(numVariant), 'num(3)')

    const strVariant = compiledEitherNumStr.construct('Right', 'foo')

    assert.equals(matchFn.call(strVariant), 'str(foo)')

    assert.end()
  })
})

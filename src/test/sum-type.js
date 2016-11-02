import test from 'tape'

import {
  Map, List,
  TermVariable, TypeVariable
} from '../lib/core'

import {
  MatchExpression,
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

    const EitherType = new ForAllType(
      aTVar, unitKind,
      new ForAllType(
        bTVar, unitKind,
        new SumType(Map({
          Left: aType,
          Right: bType
        }))))

    const EitherNumStr = new ApplicationType(
      new ApplicationType(
        EitherType, NumberType),
      StringType)

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const matchExpr = new MatchExpression(
      new VariableExpression(xVar, EitherNumStr),
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
      }),
      StringType)

    console.log(EitherType)
    console.log(matchExpr)

    assert.end()
  })
})

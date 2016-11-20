import test from 'tape'

import {
  TermVariable, TypeVariable,
  IList, IMap
} from '../lib/core'

import {
  unitTerm,
  BodyTerm,
  ValueTerm,
  VariantTerm,
  ProductTerm,
  VariableTerm,
  FixedPointTerm,
  TermLambdaTerm
} from '../lib/term'

import {
  SumType,
  unitType,
  ArrowType,
  ForAllType,
  ProductType,
  VariableType,
  FixedPointType,
  ApplicationType
} from '../lib/type'

import {
  unitKind
} from '../lib/kind'

import { compileTerm } from '../lib/util'

import {
  NumberType
} from './util'

test('fixed point test', assert => {
  assert.test('basic fixed term', assert => {
    const fVar = new TermVariable('f')
    const xVar = new TermVariable('x')

    const fibType = new ArrowType(NumberType, NumberType)

    const fibLambda = new FixedPointTerm(
      fVar, fibType,
      new TermLambdaTerm(
        xVar, NumberType,
        new BodyTerm(
          IList([
            new VariableTerm(fVar, fibType),
            new VariableTerm(xVar, NumberType)
          ]),
          NumberType,
          (compiledFibType, compiledNumType) =>
            (fib, x) => {
              if(x === 0) return 0
              if(x === 1) return 1

              return fib.call(x-1) + fib.call(x-2)
            })))

    const compiledFib = compileTerm(fibLambda)

    assert.equals(compiledFib.call(6), 8)

    assert.end()
  })

  assert.test('fixed point type', assert => {
    const aTVar = new TypeVariable('a')
    const lTVar = new TypeVariable('l')

    const aType = new VariableType(aTVar, unitKind)
    const lType = new VariableType(lTVar, unitKind)

    // ListType = forall a . fixed l .
    //     Nil () |
    //     Cons l a
    const ListType = new ForAllType(
      aTVar, unitKind,
      new FixedPointType(
        lTVar, unitKind,
        new SumType(IMap({
          Nil: unitType,
          Cons: new ProductType(
            IList([
              aType,
              lType
            ]))
        }))))

    const NumListType = new ApplicationType(
      ListType, NumberType)

    const nilList = new VariantTerm(
      NumListType.transposedType(),
      'Nil',
      unitTerm)

    // oneList :: List number
    const oneList = new VariantTerm(
      NumListType.transposedType(),
      'Cons',
      new ProductTerm(IList([
        new ValueTerm(1, NumberType),
        nilList
      ])))

    const twoList = new VariantTerm(
      NumListType.transposedType(),
      'Cons',
      new ProductTerm(IList([
        new ValueTerm(1, NumberType),
        oneList
      ])))

    assert.end()
  })
})

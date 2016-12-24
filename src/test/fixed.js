import test from 'tape'

import {
  TermVariable, TypeVariable,
  IList, IMap
} from '../lib/core'

import {
  LetTerm,
  unitTerm,
  BodyTerm,
  FoldTerm,
  MatchTerm,
  ValueTerm,
  RecordTerm,
  UnfoldTerm,
  VariantTerm,
  ProductTerm,
  VariableTerm,
  FixedPointTerm,
  ValueLambdaTerm,
  ProjectRecordTerm,
  TermApplicationTerm
} from '../lib/term'

import {
  SumType,
  unitType,
  ArrowType,
  ForAllType,
  RecordType,
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
  NumberType, BooleanType
} from './util'

test('fixed point test', assert => {
  assert.test('basic fixed term', assert => {
    const fVar = new TermVariable('f')
    const xVar = new TermVariable('x')

    const fibType = new ArrowType(NumberType, NumberType)

    const fibLambda = new FixedPointTerm(
      new ValueLambdaTerm(
        fVar, fibType,
        new ValueLambdaTerm(
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
              }))))

    const compiledFib = compileTerm(fibLambda)

    assert.equals(compiledFib.call(6), 8)

    assert.end()
  })

  assert.test('mutually recursive lambda', assert => {
    const predType = new ArrowType(NumberType, BooleanType)
    const ieioType = new RecordType(IMap({
      isOdd: predType,
      isEven: predType
    }))

    const xVar = new TermVariable('x')
    const isOddVar = new TermVariable('isOdd')
    const isEvenVar = new TermVariable('isEven')
    const ieioVar = new TermVariable('ieio')

    const ieioTerm = new FixedPointTerm(
      new ValueLambdaTerm(
        ieioVar, ieioType,

        new LetTerm(
          isOddVar,
          new ProjectRecordTerm(
            new VariableTerm(ieioVar, ieioType),
            'isOdd'),
          new LetTerm(
            isEvenVar,
            new ProjectRecordTerm(
              new VariableTerm(ieioVar, ieioType),
              'isEven'),

            new RecordTerm(IMap({
              isOdd: new ValueLambdaTerm(
                xVar, NumberType,
                new BodyTerm(
                  IList([
                    new VariableTerm(isEvenVar, predType),
                    new VariableTerm(xVar, NumberType)
                  ]),
                  BooleanType,
                  () => (isEven, x) => {
                    if(x == 0) return false
                    return isEven.call(x-1)
                  })),

              isEven: new ValueLambdaTerm(
                xVar, NumberType,
                new BodyTerm(
                  IList([
                    new VariableTerm(isOddVar, predType),
                    new VariableTerm(xVar, NumberType)
                  ]),
                  BooleanType,
                  () => (isOdd, x) => {
                    if(x == 0) return true
                    return isOdd.call(x-1)
                  }))
            }))))))

    const ieio = compileTerm(ieioTerm)
    const isOdd = ieio.get('isOdd')
    const isEven = ieio.get('isEven')

    assert.equals(isOdd.call(0), false)
    assert.equals(isEven.call(0), true)

    assert.equals(isOdd.call(3), true)
    assert.equals(isOdd.call(4), false)

    assert.equals(isEven.call(3), false)
    assert.equals(isEven.call(4), true)

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

    const UnfoldNumList = NumListType.unfoldType()
    const NumConsType = new ProductType(IList(
      [NumberType, NumListType]))

    const nilList = new FoldTerm(
      NumListType,
      new VariantTerm(
        UnfoldNumList,
        'Nil',
        unitTerm))

    // oneList :: List number
    const oneList = new FoldTerm(
      NumListType,
      new VariantTerm(
        UnfoldNumList,
        'Cons',
        new ProductTerm(IList([
          new ValueTerm(1, NumberType),
          nilList
        ]))))

    const twoList = new FoldTerm(
      NumListType,
      new VariantTerm(
        UnfoldNumList,
        'Cons',
        new ProductTerm(IList([
          new ValueTerm(1, NumberType),
          oneList
        ]))))

    // console.log(twoList)

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const isNilLambda = new ValueLambdaTerm(
      xVar, NumListType,
      new MatchTerm(
        new UnfoldTerm(
          new VariableTerm(xVar, NumListType)),
        BooleanType,
        IMap({
          Nil: new ValueLambdaTerm(
            yVar, unitType,
            new ValueTerm(
              true, BooleanType)),
          Cons: new ValueLambdaTerm(
            yVar, NumConsType,
            new ValueTerm(
              false, BooleanType))
        })))

    // console.log('isNilLambda:', isNilLambda)

    assert.end()
  })
})

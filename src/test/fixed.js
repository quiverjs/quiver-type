import test from 'tape'

import { IList } from '../lib/core'

import {
  termVar, typeVar,
  lets, unitTerm, body, fold, match,
  value, record, unfold, variant, product,
  varTerm, fixed, lambda, projectRecord,
  sumType, unitType, arrow, forall,
  recordType, productType, varType,
  fixedType, applicationType,
  unitKind, unit
} from '../lib/dsl'

import { compileTerm } from '../lib/util'

import {
  NumberType, BooleanType
} from '../lib/builtin'

test('fixed point test', assert => {
  assert.test('basic fixed term', assert => {
    const fVar = termVar('f')
    const xVar = termVar('x')

    const fibType = arrow(NumberType, NumberType)

    const fibLambda = fixed(
      lambda(
        [[fVar, fibType],
         [xVar, NumberType]],
        body(
          [varTerm(fVar, fibType),
           varTerm(xVar, NumberType)],
          NumberType,
            (fib, x) => {
              if(x === 0) return 0
              if(x === 1) return 1

              return fib.call(x-1) + fib.call(x-2)
            })))

    const compiledFib = compileTerm(fibLambda)

    assert.equals(compiledFib.call(6), 8)

    assert.end()
  })

  assert.test('mutually recursive lambda', assert => {
    const predType = arrow(NumberType, BooleanType)
    const ieioType = recordType({
      isOdd: predType,
      isEven: predType
    })

    const xVar = termVar('x')
    const isOddVar = termVar('isOdd')
    const isEvenVar = termVar('isEven')
    const ieioVar = termVar('ieio')

    const ieioTerm = fixed(
      lambda(
        [[ieioVar, ieioType]],
        lets(
          [[isOddVar,
            projectRecord(
              varTerm(ieioVar, ieioType),
              'isOdd')],
           [isEvenVar,
            projectRecord(
              varTerm(ieioVar, ieioType),
              'isEven')]],

          record({
            isOdd: lambda(
              [[xVar, NumberType]],
              body(
                [varTerm(isEvenVar, predType),
                 varTerm(xVar, NumberType)],
                BooleanType,
                (isEven, x) => {
                  if(x == 0) return false
                  return isEven.call(x-1)
                })),

            isEven: lambda(
              [[xVar, NumberType]],
              body(
                [varTerm(isOddVar, predType),
                 varTerm(xVar, NumberType)],
                BooleanType,
                (isOdd, x) => {
                  if(x == 0) return true
                  return isOdd.call(x-1)
                }))
          }))))

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
    const aTVar = typeVar('a')
    const lTVar = typeVar('l')

    const aType = varType(aTVar, unitKind)
    const lType = varType(lTVar, unitKind)

    // ListType = forall a . fixed l .
    //     Nil () |
    //     Cons l a
    const ListType = forall(
      [[aTVar, unitKind]],
      fixedType(
        lTVar, unitKind,
        sumType({
          Nil: unitType,
          Cons: productType(aType, lType)
        })))

    const NumListType = applicationType(
      ListType, NumberType)

    const UnfoldNumList = NumListType.unfoldType()
    const NumConsType = productType(NumberType, NumListType)

    const nilList = fold(
      NumListType,
      variant(
        UnfoldNumList,
        'Nil',
        unitTerm))

    // oneList :: List number
    const oneList = fold(
      NumListType,
      variant(
        UnfoldNumList,
        'Cons',
        product(
          value(1, NumberType),
          nilList)))

    const twoList = fold(
      NumListType,
      variant(
        UnfoldNumList,
        'Cons',
        product(
          value(2, NumberType),
          oneList)))

    const xVar = termVar('x')
    const yVar = termVar('y')

    const isNilLambda = lambda(
      [[xVar, NumListType]],
      match(
        unfold(
          varTerm(xVar, NumListType)),
        BooleanType,
        {
          Nil: lambda(
            [[yVar, unitType]],
            value(true, BooleanType)),
          Cons: lambda(
            [[yVar, NumConsType]],
            value(false, BooleanType))
        }))

    const compiledList = NumListType.compileType()

    const nil = compileTerm(nilList)
    const list1 = compileTerm(oneList)
    const list2 = compileTerm(twoList)

    assert.notOk(compiledList.typeCheck(nil))
    assert.notOk(compiledList.typeCheck(list1))
    assert.notOk(compiledList.typeCheck(list2))

    const nil2 = compiledList.construct('Nil', unit)
    const list3 = compiledList.construct('Cons', IList([3, list2]))

    assert.notOk(compiledList.typeCheck(nil2))
    assert.notOk(compiledList.typeCheck(list3))

    const isNilFn = compileTerm(isNilLambda)

    assert.equals(isNilFn.call(nil), true)
    assert.equals(isNilFn.call(nil2), true)
    assert.equals(isNilFn.call(list1), false)
    assert.equals(isNilFn.call(list2), false)
    assert.equals(isNilFn.call(list3), false)

    assert.end()
  })
})

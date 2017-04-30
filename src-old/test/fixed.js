import test from 'tape'

import { IList } from '../lib/core'

import {
  lets, unitTerm, body, fold,
  match, when,
  value, record, unfold,
  variant, product,
  varTerm, fixed, lambda, projectRecord,
  sumType, unitType, arrow, forall,
  recordType, productType, varType,
  fixedType, unfoldType, typeApp,
  unitKind, unit, compile
} from '../lib/dsl'

import {
  NumberType, BooleanType
} from '../lib/prelude'

test('fixed point test', assert => {
  assert.test('basic fixed term', assert => {
    const fibType = arrow(NumberType, NumberType)

    const fibLambda = fixed(
      lambda(
        [['f', fibType],
         ['x', NumberType]],
        body(
          [varTerm('f', fibType),
           varTerm('x', NumberType)],
          NumberType,
            (fib, x) => {
              if(x === 0) return 0
              if(x === 1) return 1

              return fib.call(x-1) + fib.call(x-2)
            })))

    const compiledFib = compile(fibLambda)

    assert.equals(compiledFib.call(6), 8)

    assert.end()
  })

  assert.test('mutually recursive lambda', assert => {
    const predType = arrow(NumberType, BooleanType)
    const ieioType = recordType({
      isOdd: predType,
      isEven: predType
    })

    const ieioTerm = fixed(
      lambda(
        [['ieio', ieioType]],
        lets(
          [['is-odd',
            projectRecord(
              varTerm('ieio', ieioType),
              'isOdd')],
           ['is-even',
            projectRecord(
              varTerm('ieio', ieioType),
              'isEven')]],

          record({
            isOdd: lambda(
              [['x', NumberType]],
              body(
                [varTerm('is-even', predType),
                 varTerm('x', NumberType)],
                BooleanType,
                (isEven, x) => {
                  if(x == 0) return false
                  return isEven.call(x-1)
                })),

            isEven: lambda(
              [['x', NumberType]],
              body(
                [varTerm('is-odd', predType),
                 varTerm('x', NumberType)],
                BooleanType,
                (isOdd, x) => {
                  if(x == 0) return true
                  return isOdd.call(x-1)
                }))
          }))))

    const ieio = compile(ieioTerm)
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
    const aType = varType('a', unitKind)
    const lType = varType('l', unitKind)

    // ListType = forall a . fixed l .
    //     Nil () |
    //     Cons l a
    const ListType = forall(
      [['a', unitKind]],
      fixedType(
        'l', unitKind,
        sumType({
          Nil: unitType,
          Cons: productType(aType, lType)
        })))

    const NumListType = typeApp(
      ListType, NumberType)

    const UnfoldNumList = unfoldType(NumListType)

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

    const isNilLambda = lambda(
      [['x', NumListType]],
      match(
        unfold(varTerm('x', NumListType)),
        BooleanType,

        when(UnfoldNumList, 'Nil', '_',
          value(true, BooleanType)),

        when(UnfoldNumList, 'Cons', '_',
          value(false, BooleanType))))

    const compiledList = NumListType.compileType()

    const nil = compile(nilList)
    const list1 = compile(oneList)
    const list2 = compile(twoList)

    assert.notOk(compiledList.typeCheck(nil))
    assert.notOk(compiledList.typeCheck(list1))
    assert.notOk(compiledList.typeCheck(list2))

    const nil2 = compiledList.construct('Nil', unit)
    const list3 = compiledList.construct('Cons', IList([3, list2]))

    assert.notOk(compiledList.typeCheck(nil2))
    assert.notOk(compiledList.typeCheck(list3))

    const isNilFn = compile(isNilLambda)

    assert.equals(isNilFn.call(nil), true)
    assert.equals(isNilFn.call(nil2), true)
    assert.equals(isNilFn.call(list1), false)
    assert.equals(isNilFn.call(list2), false)
    assert.equals(isNilFn.call(list3), false)

    assert.end()
  })
})

import test from 'tape'

import {
  IMap, IList
} from '../lib/core'

import {
  varGen, value, lambda,
  record, product,
  recordType, productType,
  updateRecord, updateProduct,
  projectRecord, projectProduct,
  compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

test('product type test', assert => {
  assert.test('basic product', assert => {
    const numStrType = productType(NumberType, StringType)

    const numStrTerm = product(
      value(3, NumberType),
      value('foo', StringType))

    assert.notOk(numStrType.typeCheck(numStrTerm.termType()))

    const numStrValue = compile(numStrTerm)

    assert.ok(IList.isList(numStrValue))
    assert.deepEquals(numStrValue.toArray(), [3, 'foo'])

    assert.end()
  })

  assert.test('basic record', assert => {
    const numStrType = recordType({
      num: NumberType,
      str: StringType
    })

    const numStrTerm = record({
      num: value(3, NumberType),
      str: value('foo', StringType)
    })

    assert.notOk(numStrType.typeCheck(numStrTerm.termType()))

    const numStrValue = compile(numStrTerm)

    assert.ok(IMap.isMap(numStrValue))
    assert.deepEquals(numStrValue.toObject(), {
      num: 3,
      str: 'foo'
    })

    assert.end()
  })

  assert.test('closure product', assert => {
    const { termVar, varTerm } = varGen()

    const makePairLambda = lambda(
      [[termVar('x'), StringType]],
      product(
        value(8, NumberType),
        varTerm('x', StringType)
      ))

    const makePairFn = compile(makePairLambda)
    const pair1 = makePairFn.call('foo')

    assert.ok(IList.isList(pair1))
    assert.deepEquals(pair1.toArray(), [8, 'foo'])

    const pair2 = makePairFn.call('bar')
    assert.deepEquals(pair2.toArray(), [8, 'bar'])

    assert.end()
  })

  assert.test('closure record', assert => {
    const { termVar, varTerm } = varGen()

    const makePairLambda = lambda(
      [[termVar('x'), StringType]],
      record({
        num: value(8, NumberType),
        str: varTerm('x', StringType)
      }))

    const makePairFn = compile(makePairLambda)
    const pair1 = makePairFn.call('foo')

    assert.ok(IMap.isMap(pair1))
    assert.deepEquals(pair1.toObject(), {
      num: 8,
      str: 'foo'
    })

    const pair2 = makePairFn.call('bar')
    assert.deepEquals(pair2.toObject(), {
      num: 8, str: 'bar'
    })

    assert.end()
  })

  assert.test('project product', assert => {
    const { termVar, varTerm } = varGen()

    const numTerm = value(3, NumberType)
    const strTerm = value('foo', StringType)

    const numStrTerm = product(numTerm, strTerm)

    const numStrType = productType(NumberType, StringType)

    const projectTerm = projectProduct(numStrTerm, 1)

    assert.equals(projectTerm.evaluate(), strTerm)
    assert.equals(compile(projectTerm), 'foo')

    assert.throws(() => projectProduct(numStrTerm, 3))
    assert.throws(() => projectProduct(numStrTerm, 'invalid key'))

    const firstLambda = lambda(
      [[termVar('x'), numStrType]],
      projectProduct(
        varTerm('x', numStrType),
        0))

    const firstFn = compile(firstLambda)
    assert.equals(firstFn.call(IList([4, 'bar'])), 4)

    assert.throws(() => firstFn.call(IList([3, 'foo', 'extra'])))
    assert.throws(() => firstFn.call(IList(['invalid', 99])))
    assert.throws(() => firstFn.call(IList([0])))
    assert.throws(() => firstFn.call([1, 'no']))
    assert.throws(() => firstFn.call())

    assert.end()
  })

  assert.test('project record', assert => {
    const { termVar, varTerm } = varGen()

    const numTerm = value(3, NumberType)
    const strTerm = value('foo', StringType)

    const numStrTerm = record({
      num: numTerm,
      str: strTerm
    })

    const numStrType = recordType({
      num: NumberType,
      str: StringType
    })

    const projectTerm = projectRecord(numStrTerm, 'str')

    assert.equals(projectTerm.evaluate(), strTerm)
    assert.equals(compile(projectTerm), 'foo')

    assert.throws(() => projectRecord(numStrTerm, 3))
    assert.throws(() => projectRecord(numStrTerm, 'invalid key'))

    const firstLambda = lambda(
      [[termVar('x'), numStrType]],
      projectRecord(
        varTerm('x', numStrType),
        'num'))

    const firstFn = compile(firstLambda)
    assert.equals(firstFn.call(IMap({
      num: 4,
      str: 'bar'
    })), 4)

    assert.throws(() => firstFn.call(IMap({
      num: 3,
      str: 'foo',
      extra: 'extra'
    })))

    assert.throws(() => firstFn.call(IMap({
      num: 'invalid',
      str: 99
    })))

    assert.throws(() => firstFn.call(IMap({
      num: 0
    })))

    assert.throws(() => firstFn.call({
      num: 1, str: 'no'
    }))

    assert.throws(() => firstFn.call())

    assert.end()
  })

  assert.test('update product', assert => {
    const { termVar, varTerm } = varGen()

    const numStrTerm = product(
      value(3, NumberType),
      value('foo', StringType))

    const numStrType = productType(NumberType, StringType)

    const updateTerm = updateProduct(
      numStrTerm, 1,
      value('bar', StringType))

    assert.deepEquals(compile(updateTerm).toArray(), [3, 'bar'])

    assert.throws(() => updateProduct(
      numStrTerm, 3,
      value('bar', StringType)))

    assert.throws(() => updateProduct(
      numStrTerm, 'invalid',
      value('bar', StringType)))

    const updateSecondLambda = lambda(
      [[termVar('x'), numStrType],
       [termVar('y'), StringType]],
      updateProduct(
        varTerm('x', numStrType),
        1,
        varTerm('y', StringType)))

    const updateSecondFn = compile(updateSecondLambda)

    assert.deepEquals(updateSecondFn.call(
      IList([5, 'food']), 'beer').toArray(),
      [5, 'beer'])

    assert.end()
  })

  assert.test('update record', assert => {
    const { termVar, varTerm } = varGen()

    const numStrTerm = record({
      num: value(3, NumberType),
      str: value('foo', StringType)
    })

    const numStrType = recordType({
      num: NumberType,
      str: StringType
    })

    const updateTerm = updateRecord(
      numStrTerm, 'str',
      value('bar', StringType))

    assert.deepEquals(compile(updateTerm).toObject(), {
      num: 3,
      str: 'bar'
    })

    assert.throws(() => updateRecord(
      numStrTerm, 0,
      value('bar', StringType)))

    assert.throws(() => updateRecord(
      numStrTerm, 'invalid',
      value('bar', StringType)))

    const updateSecondLambda = lambda(
      [[termVar('x'), numStrType],
       [termVar('y'), StringType]],
      updateRecord(
        varTerm('x', numStrType),
        'str',
        varTerm('y', StringType)))

    const updateSecondFn = compile(updateSecondLambda)

    assert.deepEquals(
      updateSecondFn.call(
        IMap({
          num: 5,
          str: 'food'
        }),
        'beer'
      ).toObject(),
      {
        num: 5,
        str: 'beer'
      })

    assert.end()
  })
})

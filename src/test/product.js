import test from 'tape'

import {
  IMap, IList,
  TermVariable
} from '../lib/core'

import {
  ValueTerm,
  RecordTerm,
  ProductTerm,
  VariableTerm,
  ValueLambdaTerm,
  UpdateRecordTerm,
  UpdateProductTerm,
  ProjectRecordTerm,
  ProjectProductTerm,
} from '../lib/term'

import {
  RecordType,
  ProductType
} from '../lib/type'

import { compileTerm } from '../lib/util'

import {
  NumberType, StringType
} from './util'

test('product type test', assert => {
  assert.test('basic product', assert => {
    const numStrType = new ProductType(IList([
      NumberType, StringType
    ]))

    const numStrTerm = new ProductTerm(IList([
      new ValueTerm(3, NumberType),
      new ValueTerm('foo', StringType)
    ]))

    assert.notOk(numStrType.typeCheck(numStrTerm.termType()))

    const numStrValue = compileTerm(numStrTerm)

    assert.ok(IList.isList(numStrValue))
    assert.deepEquals(numStrValue.toArray(), [3, 'foo'])

    assert.end()
  })

  assert.test('basic record', assert => {
    const numStrType = new RecordType(IMap({
      num: NumberType,
      str: StringType
    }))

    const numStrTerm = new RecordTerm(IMap({
      num: new ValueTerm(3, NumberType),
      str: new ValueTerm('foo', StringType)
    }))

    assert.notOk(numStrType.typeCheck(numStrTerm.termType()))

    const numStrValue = compileTerm(numStrTerm)

    assert.ok(IMap.isMap(numStrValue))
    assert.deepEquals(numStrValue.toObject(), {
      num: 3,
      str: 'foo'
    })

    assert.end()
  })

  assert.test('closure product', assert => {
    const xVar = new TermVariable('x')
    const makePairLambda = new ValueLambdaTerm(
      xVar, StringType,
      new ProductTerm(IList([
        new ValueTerm(8, NumberType),
        new VariableTerm(xVar, StringType)
      ])))

    const makePairFn = compileTerm(makePairLambda)
    const pair1 = makePairFn.call('foo')

    assert.ok(IList.isList(pair1))
    assert.deepEquals(pair1.toArray(), [8, 'foo'])

    const pair2 = makePairFn.call('bar')
    assert.deepEquals(pair2.toArray(), [8, 'bar'])

    assert.end()
  })

  assert.test('closure record', assert => {
    const xVar = new TermVariable('x')

    const makePairLambda = new ValueLambdaTerm(
      xVar, StringType,
      new RecordTerm(IMap({
        num: new ValueTerm(8, NumberType),
        str: new VariableTerm(xVar, StringType)
      })))

    const makePairFn = compileTerm(makePairLambda)
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
    const numTerm = new ValueTerm(3, NumberType)
    const strTerm = new ValueTerm('foo', StringType)

    const numStrTerm = new ProductTerm(IList([
      numTerm, strTerm
    ]))

    const numStrType = new ProductType(IList([
      NumberType, StringType
    ]))

    const projectTerm = new ProjectProductTerm(
      numStrTerm, 1)

    assert.equals(projectTerm.evaluate(), strTerm)
    assert.equals(compileTerm(projectTerm), 'foo')

    assert.throws(() => new ProjectProductTerm(numStrTerm, 3))
    assert.throws(() => new ProjectProductTerm(numStrTerm, 'invalid key'))

    const xVar = new TermVariable('x')

    const firstLambda = new ValueLambdaTerm(
      xVar, numStrType,
      new ProjectProductTerm(
        new VariableTerm(xVar, numStrType),
        0))

    const firstFn = compileTerm(firstLambda)
    assert.equals(firstFn.call(IList([4, 'bar'])), 4)

    assert.throws(() => firstFn.call(IList([3, 'foo', 'extra'])))
    assert.throws(() => firstFn.call(IList(['invalid', 99])))
    assert.throws(() => firstFn.call(IList([0])))
    assert.throws(() => firstFn.call([1, 'no']))
    assert.throws(() => firstFn.call())

    assert.end()
  })

  assert.test('project record', assert => {
    const numTerm = new ValueTerm(3, NumberType)
    const strTerm = new ValueTerm('foo', StringType)

    const numStrTerm = new RecordTerm(IMap({
      num: numTerm,
      str: strTerm
    }))

    const numStrType = new RecordType(IMap({
      num: NumberType,
      str: StringType
    }))

    const projectTerm = new ProjectRecordTerm(
      numStrTerm, 'str')

    assert.equals(projectTerm.evaluate(), strTerm)
    assert.equals(compileTerm(projectTerm), 'foo')

    assert.throws(() => new ProjectProductTerm(numStrTerm, 3))
    assert.throws(() => new ProjectProductTerm(numStrTerm, 'invalid key'))

    const xVar = new TermVariable('x')

    const firstLambda = new ValueLambdaTerm(
      xVar, numStrType,
      new ProjectRecordTerm(
        new VariableTerm(xVar, numStrType),
        'num'))

    const firstFn = compileTerm(firstLambda)
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
    const numStrTerm = new ProductTerm(IList([
      new ValueTerm(3, NumberType),
      new ValueTerm('foo', StringType)
    ]))

    const numStrType = new ProductType(IList([
      NumberType, StringType
    ]))

    const updateTerm = new UpdateProductTerm(
      numStrTerm, 1,
      new ValueTerm('bar', StringType))

    assert.deepEquals(compileTerm(updateTerm).toArray(), [3, 'bar'])

    assert.throws(() => new UpdateProductTerm(
      numStrTerm, 3,
      new ValueTerm('bar', StringType)))

    assert.throws(() => new UpdateProductTerm(
      numStrTerm, 'invalid',
      new ValueTerm('bar', StringType)))

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const updateSecondLambda = new ValueLambdaTerm(
      xVar, numStrType,
      new ValueLambdaTerm(
        yVar, StringType,
        new UpdateProductTerm(
          new VariableTerm(xVar, numStrType),
          1,
          new VariableTerm(yVar, StringType))))

    const updateSecondFn = compileTerm(updateSecondLambda)

    assert.deepEquals(updateSecondFn.call(
      IList([5, 'food']), 'beer').toArray(),
      [5, 'beer'])

    assert.end()
  })

  assert.test('update record', assert => {
    const numStrTerm = new RecordTerm(IMap({
      num: new ValueTerm(3, NumberType),
      str: new ValueTerm('foo', StringType)
    }))

    const numStrType = new RecordType(IMap({
      num: NumberType,
      str: StringType
    }))

    const updateTerm = new UpdateRecordTerm(
      numStrTerm, 'str',
      new ValueTerm('bar', StringType))

    assert.deepEquals(compileTerm(updateTerm).toObject(), {
      num: 3,
      str: 'bar'
    })

    assert.throws(() => new UpdateRecordTerm(
      numStrTerm, 0,
      new ValueTerm('bar', StringType)))

    assert.throws(() => new UpdateRecordTerm(
      numStrTerm, 'invalid',
      new ValueTerm('bar', StringType)))

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const updateSecondLambda = new ValueLambdaTerm(
      xVar, numStrType,
      new ValueLambdaTerm(
        yVar, StringType,
        new UpdateRecordTerm(
          new VariableTerm(xVar, numStrType),
          'str',
          new VariableTerm(yVar, StringType))))

    const updateSecondFn = compileTerm(updateSecondLambda)

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

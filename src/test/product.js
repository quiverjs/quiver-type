import test from 'tape'

import {
  IMap, IList,
  TermVariable, TypeVariable
} from '../lib/core'

import {
  ValueTerm,
  ProductTerm,
  VariableTerm,
  TermLambdaTerm,
  UpdateProductTerm,
  ProjectProductTerm,
} from '../lib/term'

import {
  ProductType,
  LiteralType
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

  assert.test('closure product', assert => {
    const xVar = new TermVariable('x')
    const makePairLambda = new TermLambdaTerm(
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

  assert.test('project term', assert => {
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

    const firstLambda = new TermLambdaTerm(
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

  assert.test('update term', assert => {
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

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const updateSecondLambda = new TermLambdaTerm(
      xVar, numStrType,
      new TermLambdaTerm(
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
})
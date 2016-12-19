import test from 'tape'

import {
  TermVariable, IList
} from '../lib/core'

import {
  BodyTerm,
  ValueTerm,
  VariableTerm,
  ValueLambdaTerm,
  TermApplicationTerm
} from '../lib/term'

import { compileTerm } from '../lib/util'

import { NumberType } from './util'

test('term compilation test', assert => {
  assert.test('term application test', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const zVar = new TermVariable('z')

    const addTerm = new BodyTerm(
      IList([
        new VariableTerm(xVar, NumberType),
        new VariableTerm(yVar, NumberType)
      ]),
      NumberType,
      (xCompiledType, yCompiledType) =>
        (x, y) => x+y)

    const addLambda = new ValueLambdaTerm(
      xVar, NumberType,
      new ValueLambdaTerm(
        yVar, NumberType, addTerm))

    const addFiveLambda = new ValueLambdaTerm(
      zVar, NumberType,
      new TermApplicationTerm(
        new TermApplicationTerm(addLambda,
          new VariableTerm(zVar, NumberType)),
        new ValueTerm(5, NumberType)))

    const compiledFunction = compileTerm(addFiveLambda)

    assert.equals(compiledFunction.call(2), 7)

    assert.end()
  })

  assert.test('partial application', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const zVar = new TermVariable('z')

    const addTerm = new BodyTerm(
      IList([
        new VariableTerm(xVar, NumberType),
        new VariableTerm(yVar, NumberType)
      ]),
      NumberType,
      (xCompiledType, yCompiledType) =>
        (x, y) => x+y)

    const addLambda = new ValueLambdaTerm(
      xVar, NumberType,
      new ValueLambdaTerm(
        yVar, NumberType, addTerm))

    const adderLambda = new ValueLambdaTerm(
      zVar, NumberType,
      new TermApplicationTerm(addLambda,
        new VariableTerm(zVar, NumberType)))

    const compiledAdder = compileTerm(adderLambda)

    const fiveAdder = compiledAdder.func(5)

    assert.equals(fiveAdder.call(2), 7)
    assert.equals(fiveAdder.call(1), 6)
    assert.equals(fiveAdder.call(-2), 3)

    assert.throws(() => fiveAdder.call('foo'))
    assert.throws(() => fiveAdder.call(2, 3))

    assert.end()
  })
})

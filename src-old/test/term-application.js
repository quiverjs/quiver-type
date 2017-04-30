import test from 'tape'

import {
  compile, varGen,
  body, value,
  lambda, apply
} from '../lib/dsl'

import { NumberType } from '../lib/prelude'

test('term compilation test', assert => {
  assert.test('term application test', assert => {
    const { termVar, varTerm } = varGen()

    const addLambda = lambda(
      [[termVar('x'), NumberType],
       [termVar('y'), NumberType]],
      body(
        [varTerm('x', NumberType),
         varTerm('y', NumberType)],
        NumberType,
        (x, y) => x+y))

    const addFiveLambda = lambda(
      [[termVar('z'), NumberType]],
      apply(addLambda,
        varTerm('z', NumberType),
        value(5, NumberType)))

    const compiledFunction = compile(addFiveLambda)

    assert.equals(compiledFunction.call(2), 7)

    assert.end()
  })

  assert.test('partial application', assert => {
    const { termVar, varTerm } = varGen()

    const addLambda = lambda(
      [[termVar('x'), NumberType],
       [termVar('y'), NumberType]],
      body(
        [varTerm('x', NumberType),
         varTerm('y', NumberType)],
        NumberType,
        (x, y) => x+y))

    const adderLambda = lambda(
      [[termVar('z'), NumberType]],
      apply(addLambda, varTerm('z', NumberType)))

    const compiledAdder = compile(adderLambda)

    const fiveAdder = compiledAdder.func(5)

    assert.equals(fiveAdder.call(2), 7)
    assert.equals(fiveAdder.call(1), 6)
    assert.equals(fiveAdder.call(-2), 3)

    assert.throws(() => fiveAdder.call('foo'))
    assert.throws(() => fiveAdder.call(2, 3))

    assert.end()
  })
})

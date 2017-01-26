import test from 'tape'

import {
  varGen, body, lambda, compile
} from '../lib/dsl'

import { NumberType } from '../lib/prelude'

test('term compilation test', assert => {
  assert.test('body term', assert => {
    const { termVar, varTerm } = varGen()

    const addTerm = body(
      [varTerm('x', NumberType),
       varTerm('y', NumberType)],
      NumberType,
      (x, y) => {
        return x+y
      })

    const addLambda = lambda(
      [[termVar('x'), NumberType],
       [termVar('y'), NumberType]],
      addTerm)

    const compiledFunction = compile(addLambda)

    assert.equals(compiledFunction.call(1, 2), 3)

    assert.throws(() => compiledFunction.call('foo', 'bar'))

    assert.end()
  })
})

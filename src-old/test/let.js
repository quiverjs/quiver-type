import test from 'tape'

import {
  varGen, lets, body,
  value, lambda, apply,
  arrow, compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

test('let term test', assert => {
  assert.test('basic let', assert => {
    const { termVar, varTerm } = varGen()

    let counter = 2
    const counterTerm = body(
      [], NumberType,
      () => {
        return counter++
      })

    const multiplyTerm = lambda(
      [[termVar('x'), NumberType],
       [termVar('y'), NumberType]],
      body(
        [varTerm('x', NumberType),
         varTerm('y', NumberType)],
        NumberType,
        (x, y) => {
          return x * y
        }))

    const callTwiceTerm = apply(
      multiplyTerm, counterTerm, counterTerm)

    // individual term applications should evaluate the
    // counter term body twice yielding result 2 * 3
    const callTwiceResult = compile(callTwiceTerm)
    assert.equals(callTwiceResult, 6)

    const squareTerm = lets(
      [[termVar('x'), counterTerm]],
      apply(
        multiplyTerm,
        varTerm('x', NumberType),
        varTerm('x', NumberType)))

    // let term evaluates the body term once
    // and use the value in multiple sites that
    // reference x.
    const squareResult = compile(squareTerm)
    assert.equals(squareResult, 16)

    assert.end()
  })

  assert.test('let term type check', assert => {
    const { termVar, varTerm } = varGen()

    assert.throws(() => {
      lets(
        [[termVar('x'), value(3, NumberType)]],
        varTerm('x', StringType))
    }, 'should type check body term have the same variable type')

    const term1 = lets(
      [[termVar('x'), value(2, NumberType)]],
      apply(
        varTerm('y', arrow(NumberType, NumberType)),
        varTerm('x', NumberType)))

    const freeVars = term1.freeTermVariables()
    assert.deepEquals([...freeVars], [termVar('y')])

    assert.equals(term1.termType(), NumberType)

    assert.equals(
      term1.bindTerm(
        termVar('x'),
        value(3, NumberType)),
      term1,
      'should not able to rebind x var in let')

    assert.end()
  })
})

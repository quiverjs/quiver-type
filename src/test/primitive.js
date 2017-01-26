import test from 'tape'

import { ISet } from '../lib/core'

import { ValueTerm } from '../lib/term'

import {
  varGen, value, rawBody,
  termVar, varTerm, compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

import { equals } from './util'

test('primitive type test', assert => {
  assert.test('value term', assert => {
    const valueTerm = value(8, NumberType)

    assert.equal(valueTerm.termType(), NumberType)
    assert.equal(valueTerm.evaluate(), valueTerm)
    assert.equal(valueTerm.value, 8)

    assert.throws(() => {
      value('foo', NumberType)
    })

    const xVar = termVar('x')
    const yVar = termVar('y')

    const xTerm = varTerm(xVar, NumberType)

    assert.ok(xTerm.freeTermVariables().equals(ISet([xVar])))

    assert.equal(xTerm.termType(), NumberType)

    assert.equal(xTerm.evaluate(), xTerm)
    assert.equal(xTerm.bindTerm(yVar, valueTerm), xTerm)

    const x2Var = termVar('x')
    assert.equal(xTerm.bindTerm(x2Var, valueTerm), xTerm,
      'term variable of same name but different instance should be distinguish')

    const xTerm2 = xTerm.bindTerm(xVar, valueTerm)
    assert.notEqual(xTerm2, xTerm)
    assert.equal(xTerm2, valueTerm)

    assert.end()
  })

  assert.test('function term', assert => {
    const { termVar, varTerm } = varGen()

    const plusTerm = rawBody(
      [varTerm('x', NumberType),
       varTerm('y', NumberType)],
      NumberType,
      (xTerm, yTerm) => {
        assert.ok(xTerm instanceof ValueTerm)
        assert.ok(yTerm instanceof ValueTerm)

        const x = xTerm.value
        const y = yTerm.value

        assert.equal(x, 3)
        assert.equal(y, 2)

        const result = x+y

        return value(result, NumberType)
      })

    assert::equals(plusTerm.freeTermVariables(),
      ISet([termVar('x'), termVar('y')]))

    assert.equals(plusTerm.evaluate(), plusTerm)

    const plusTerm2 = plusTerm.bindTerm(
      termVar('x'), value(3, NumberType))

    assert.notEqual(plusTerm2, plusTerm)

    assert::equals(plusTerm.freeTermVariables(),
      ISet([termVar('x'), termVar('y')]),
      'original term should not be modified')

    assert::equals(plusTerm2.freeTermVariables(),
      ISet([termVar('y')]),
      'new term should only have y not bounded')

    assert.equals(plusTerm2.evaluate(), plusTerm2)

    assert.throws(() => {
      plusTerm2.bindTerm(
        termVar('y'), value('foo', StringType))
    })

    const plusTerm3 = plusTerm2.bindTerm(
      termVar('y'), value(2, NumberType))

    assert::equals(plusTerm3.freeTermVariables(),
      ISet(),
      'new term should have all variables bounded')

    const resultTerm = plusTerm3.evaluate()

    assert.ok(resultTerm instanceof ValueTerm)
    assert.equal(resultTerm.value, 5)

    assert.end()
  })

  assert.test('compile constant term', assert => {
    const valueTerm = value(8, NumberType)
    const compiled = compile(valueTerm)

    assert.equals(compiled, 8)
    assert.end()
  })

  assert.test('compile variable term', assert => {
    const xVar = termVar('x')
    const xTerm = varTerm(xVar, NumberType)

    assert.throws(() => compile(xTerm))

    assert.end()
  })
})

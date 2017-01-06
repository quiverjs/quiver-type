import test from 'tape'

import {
  TermVariable, ISet, IList
} from '../lib/core'

import {
  ValueTerm,
  RawBodyTerm,
  VariableTerm
} from '../lib/term'

import { compileTerm } from '../lib/util'

import { NumberType, StringType } from '../lib/builtin'

import { equals } from './util'

test('primitive type test', assert => {
  assert.test('value term', assert => {
    const valueTerm = new ValueTerm(8, NumberType)

    assert.equal(valueTerm.termType(), NumberType)
    assert.equal(valueTerm.evaluate(), valueTerm)
    assert.equal(valueTerm.value, 8)

    assert.throws(() => {
      new ValueTerm('foo', NumberType)
    })

    const x = new TermVariable('x')
    const y = new TermVariable('y')

    const varTerm = new VariableTerm(x, NumberType)

    assert.ok(varTerm.freeTermVariables().equals(ISet([x])))

    assert.equal(varTerm.termType(), NumberType)

    assert.equal(varTerm.evaluate(), varTerm)
    assert.equal(varTerm.bindTerm(y, valueTerm), varTerm)

    const x2 = new TermVariable('x')
    assert.equal(varTerm.bindTerm(x2, valueTerm), varTerm,
      'term variable of same name but different instance should be distinguish')

    const varTerm2 = varTerm.bindTerm(x, valueTerm)
    assert.notEqual(varTerm2, varTerm)
    assert.equal(varTerm2, valueTerm)

    assert.end()
  })

  assert.test('function term', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const argTerms = IList([
      new VariableTerm(xVar, NumberType),
      new VariableTerm(yVar, NumberType)
    ])

    const doPlus = (xTerm, yTerm) => {
      const x = xTerm.value
      const y = yTerm.value

      assert.equal(x, 3)
      assert.equal(y, 2)

      const result = x+y
      return new ValueTerm(result, NumberType)
    }

    const plusTerm = new RawBodyTerm(
      argTerms, NumberType, doPlus)

    assert::equals(plusTerm.freeTermVariables(),
      ISet([xVar, yVar]))

    assert.equals(plusTerm.evaluate(), plusTerm)

    const xArg = new ValueTerm(3, NumberType)

    const plusTerm2 = plusTerm.bindTerm(xVar, xArg)

    assert.notEqual(plusTerm2, plusTerm)

    assert::equals(plusTerm.freeTermVariables(),
      ISet([xVar, yVar]),
      'original term should not be modified')

    assert::equals(plusTerm2.freeTermVariables(),
      ISet([yVar]),
      'new term should only have y not bounded')

    assert.equals(plusTerm2.evaluate(), plusTerm2)

    assert.throws(() => {
      const arg = new ValueTerm('foo', StringType)
      plusTerm2.bindTerm(yVar, arg)
    })

    const yArg = new ValueTerm(2, NumberType)

    const plusTerm3 = plusTerm2.bindTerm(yVar, yArg)

    assert::equals(plusTerm3.freeTermVariables(),
      ISet(),
      'new term should have all variables bounded')

    const resultTerm = plusTerm3.evaluate()

    assert.ok(resultTerm instanceof ValueTerm)
    assert.equal(resultTerm.value, 5)

    assert.end()
  })

  assert.test('compile constant term', assert => {
    const valueTerm = new ValueTerm(8, NumberType)
    const compiled = compileTerm(valueTerm)

    assert.equals(compiled, 8)
    assert.end()
  })

  assert.test('compile variable term', assert => {
    const xVar = new TermVariable('x')
    const varTerm = new VariableTerm(xVar, NumberType)

    assert.throws(() => compileTerm(varTerm))

    assert.end()
  })
})

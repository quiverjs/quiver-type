import test from 'tape'

import {
  TermVariable, IList
} from '../lib/core'

import {
  LetTerm,
  BodyTerm,
  ValueTerm,
  VariableTerm,
  ValueLambdaTerm,
  TermApplicationTerm
} from '../lib/term'

import {
  ArrowType
} from '../lib/type'

import { compileTerm } from '../lib/util'

import { NumberType, StringType } from '../lib/builtin'

test('let term test', assert => {
  assert.test('basic let', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    let counter = 2
    const counterTerm = new BodyTerm(IList(), NumberType,
      () => () => {
        return counter++
      })

    const multiplyTerm = new ValueLambdaTerm(
      xVar, NumberType,
      new ValueLambdaTerm(
        yVar, NumberType,
        new BodyTerm(
          IList([
            new VariableTerm(xVar, NumberType),
            new VariableTerm(yVar, NumberType),
          ]),
          NumberType,
          () => (x, y) => {
            return x * y
          })))

    const callTwiceTerm = new TermApplicationTerm(
      new TermApplicationTerm(
        multiplyTerm,
        counterTerm),
      counterTerm)

    // individual term applications should evaluate the
    // counter term body twice yielding result 2 * 3
    const callTwiceResult = compileTerm(callTwiceTerm)
    assert.equals(callTwiceResult, 6)

    const squareTerm = new LetTerm(
      xVar, counterTerm,
      new TermApplicationTerm(
        new TermApplicationTerm(
          multiplyTerm,
          new VariableTerm(xVar, NumberType)),
        new VariableTerm(xVar, NumberType)))

    // let term evaluates the body term once
    // and use the value in multiple sites that
    // reference x.
    const squareResult = compileTerm(squareTerm)
    assert.equals(squareResult, 16)

    assert.end()
  })

  assert.test('let term type check', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('x')

    assert.throws(() => {
      new LetTerm(xVar, new ValueTerm(3, NumberType),
        new VariableTerm(xVar, StringType))
    }, 'should type check body term have the same variable type')

    const term1 = new LetTerm(
      xVar, new ValueTerm(2, NumberType),
      new TermApplicationTerm(
        new VariableTerm(yVar,
          new ArrowType(NumberType, NumberType)),
        new VariableTerm(xVar, NumberType)))

    const freeVars = term1.freeTermVariables()
    assert.deepEquals([...freeVars], [yVar])

    assert.equals(term1.termType(), NumberType)

    assert.equals(
      term1.bindTerm(xVar, new ValueTerm(3, NumberType)),
      term1,
      'should not able to rebind x var in let')

    assert.end()
  })
})

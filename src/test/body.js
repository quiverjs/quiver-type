import test from 'tape'

import {
  TermVariable, List
} from '../lib/core'

import {
  BodyTerm,
  VariableTerm,
  TermLambdaTerm
} from '../lib/term'

import { compileTerm } from '../lib/util'

import { NumberType } from './util'

test('term compilation test', assert => {
  assert.test('body term', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const xVarTerm = new VariableTerm(xVar, NumberType)
    const yVarTerm = new VariableTerm(yVar, NumberType)

    const addTerm = new BodyTerm(
      List([xVarTerm, yVarTerm]), NumberType,
      (xCompiledType, yCompiledType) => {
        assert.equals(xCompiledType.srcType, NumberType)
        assert.equals(yCompiledType.srcType, NumberType)

        return (x, y) => {
          return x+y
        }
      })

    const addLambda = new TermLambdaTerm(
      xVar, NumberType,
      new TermLambdaTerm(
        yVar, NumberType, addTerm))

    const compiledFunction = compileTerm(addLambda)

    assert.equals(compiledFunction.call(1, 2), 3)

    assert.throws(() => compiledFunction.call('foo', 'bar'))

    assert.end()
  })
})

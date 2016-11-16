import test from 'tape'

import {
  TermVariable, IList
} from '../lib/core'

import {
  BodyTerm,
  VariableTerm,
  FixedPointTerm,
  TermLambdaTerm
} from '../lib/term'

import { ArrowType } from '../lib/type'
import { compileTerm } from '../lib/util'

import {
  equals, termTypeEquals,
  NumberType, StringType
} from './util'

test('fixed term test', assert => {
  assert.test('basic fixed term', assert => {
    const fVar = new TermVariable('f')
    const xVar = new TermVariable('x')

    const fibType = new ArrowType(NumberType, NumberType)

    const fibLambda = new FixedPointTerm(
      fVar, fibType,
      new TermLambdaTerm(
        xVar, NumberType,
        new BodyTerm(
          IList([
            new VariableTerm(fVar, fibType),
            new VariableTerm(xVar, NumberType)
          ]),
          NumberType,
          (compiledFibType, compiledNumType) =>
            (fib, x) => {
              if(x === 0) return 0
              if(x === 1) return 1

              return fib.call(x-1) + fib.call(x-2)
            })))

    const compiledFib = compileTerm(fibLambda)

    assert.equals(compiledFib.call(6), 8)

    assert.end()
  })
})

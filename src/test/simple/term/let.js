import test from 'tape'

import { varTerm } from '../../../lib/simple/term/variable'
import { valueTerm, arrowValueTerm } from '../../../lib/simple/term/value'
import { applyTerm } from '../../../lib/simple/term/apply'
import { letTerm } from '../../../lib/simple/term/let'

import {
  evalTerm
} from '../../../lib/simple/term/eval'

import {
  simpleArrowFunction,
} from '../../../lib/simple/arrow'

import {
  StringType
} from '../../../lib/simple/prelude/primitive'

import {
  nil
} from '../../../lib/container'

test('LetTerm test', assert => {
  assert.test('trivial let', assert => {
    const fooTerm = valueTerm(StringType, 'foo')

    const term = letTerm(
      [['x', fooTerm]],
      varTerm('x', StringType))

    assert.deepEquals([...term.freeTermVariables()], [])

    assert.equals(term.normalForm(), fooTerm)
    assert.equals(evalTerm(term), 'foo')

    const closure = term.compileClosure(nil)
    assert.equals(closure.bindValues(nil), 'foo')

    assert.equals(evalTerm(term), 'foo')

    assert.end()
  })

  assert.test('let evaluation order', assert => {
    const calledArgs = []

    const idFunc = simpleArrowFunction(
      [StringType],
      StringType,
      arg => {
        calledArgs.push(arg)
        return arg
      })

    const joinFunc = simpleArrowFunction(
      [StringType, StringType],
      StringType,
      (a, b) => `(${a} ${b})`)

    const idTerm = arrowValueTerm(idFunc)
    const joinTerm = arrowValueTerm(joinFunc)

    const testTerm = letTerm(
      [['x', applyTerm(idTerm, valueTerm(StringType, 'foo'))],
       ['y', applyTerm(idTerm, valueTerm(StringType, 'bar'))]],
      applyTerm(
        joinTerm,
        varTerm('x', StringType),
        varTerm('y', StringType)))

    assert.equals(testTerm.normalForm(), testTerm)

    const testResult = evalTerm(testTerm)
    assert.equals(testResult, '(foo bar)')

    assert.deepEquals(calledArgs, ['foo', 'bar'],
      'let evaluation order is left to right (outermost first)')

    assert.end()
  })
})

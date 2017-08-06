import test from 'tape'

import { varTerm } from '../../../lib/simple/term/variable'
import { valueTerm, arrowValueTerm } from '../../../lib/simple/term/value'
import { applyTerm } from '../../../lib/simple/term/apply'

import {
  evalTerm
} from '../../../lib/simple/term/eval'

import {
  arrowType
} from '../../../lib/simple/type/arrow'

import {
  simpleArrowFunction,
} from '../../../lib/simple/arrow'

import {
  StringType
} from '../../../lib/simple/prelude/primitive'

import {
  valueNode, iterToNode
} from '../../../lib/container'

test('ApplyTerm test', assert => {
  assert.test('apply arrow function', assert => {
    const joinType = arrowType(StringType, StringType, StringType)

    const joinFunc = simpleArrowFunction(
      [StringType, StringType],
      StringType,
      (a, b) => `(${a} ${b})`)

    const joinTerm = valueTerm(joinType, joinFunc)
    const fooTerm = valueTerm(StringType, 'foo')
    const barTerm = valueTerm(StringType, 'bar')

    const appTerm = applyTerm(joinTerm, fooTerm, barTerm)

    assert.equals(evalTerm(appTerm), '(foo bar)')

    assert.end()
  })

  assert.test('apply variable 1', assert => {
    const joinType = arrowType(StringType, StringType, StringType)

    const joinFunc = simpleArrowFunction(
      [StringType, StringType],
      StringType,
      (a, b) => `(${a} ${b})`)

    const jTerm = varTerm('j', joinType)
    const fooTerm = valueTerm(StringType, 'foo')
    const barTerm = valueTerm(StringType, 'bar')

    const appTerm = applyTerm(jTerm, fooTerm, barTerm)

    assert.deepEquals([...appTerm.freeTermVariables()], ['j'])

    const closure = appTerm.compileClosure(valueNode('j'))
    assert.equals(closure.bindValues(valueNode(joinFunc)), '(foo bar)')

    assert.end()
  })

  assert.test('apply variable 2', assert => {
    const joinType = arrowType(StringType, StringType, StringType)

    const joinFunc = simpleArrowFunction(
      [StringType, StringType],
      StringType,
      (a, b) => `(${a} ${b})`)

    const fTerm = varTerm('f', joinType)
    const aTerm = varTerm('a', StringType)
    const bTerm = varTerm('b', StringType)

    const appTerm = applyTerm(fTerm, aTerm, bTerm)

    const closure = appTerm.compileClosure(iterToNode(['b', 'f', 'a']))
    assert.equals(
      closure.bindValues(
        iterToNode(['bar', joinFunc, 'foo'])),
      '(foo bar)')

    assert.end()
  })

  assert.test('apply evaluation order', assert => {
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

    const testTerm = applyTerm(
      joinTerm,
      applyTerm(idTerm, valueTerm(StringType, 'foo')),
      applyTerm(idTerm, valueTerm(StringType, 'bar')))

    assert.equals(testTerm.normalForm(), testTerm)

    const testResult = evalTerm(testTerm)
    assert.equals(testResult, '(foo bar)')

    assert.deepEquals(calledArgs, ['bar', 'foo'],
      'apply evaluation order is right to left (outermost first)')

    assert.end()
  })
})

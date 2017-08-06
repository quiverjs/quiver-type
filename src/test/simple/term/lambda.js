import test from 'tape'

import { varTerm } from '../../../lib/simple/term/variable'
import { valueTerm } from '../../../lib/simple/term/value'
import { applyTerm } from '../../../lib/simple/term/apply'
import { lambda } from '../../../lib/simple/term/lambda'

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
  StringType, IntType
} from '../../../lib/simple/prelude/primitive'

test('LambdaTerm test', assert => {
  assert.test('first lambda', assert => {
    const firstTerm = lambda(
      [['x', StringType],
       ['y', StringType]],
      varTerm('x', StringType))

    assert.deepEquals([...firstTerm.freeTermVariables()], [])

    assert.notOk(firstTerm.validateVarType('x', IntType))
    assert.equals(firstTerm.bindTerm('x', valueTerm(StringType, 'foo')), firstTerm)

    const firstFunc = evalTerm(firstTerm)
    assert.equals(firstFunc.apply('foo', 'bar'), 'foo')

    const appTerm = applyTerm(firstTerm,
      valueTerm(StringType, 'foo'),
      valueTerm(StringType, 'bar'))

    assert.equals(evalTerm(appTerm), 'foo')

    const constTerm = applyTerm(firstTerm, valueTerm(StringType, 'foo'))
    const constFunc = evalTerm(constTerm)

    assert.equals(constFunc.apply('bar'), 'foo')
    assert.equals(constFunc.apply('baz'), 'foo')

    assert.end()
  })

  assert.test('app lambda', assert => {
    const joinType = arrowType(StringType, StringType, StringType)

    const joinFunc = simpleArrowFunction(
      [StringType, StringType],
      StringType,
      (a, b) => `(${a} ${b})`)

    const appTerm = lambda(
      [['f', joinType],
       ['x', StringType],
       ['y', StringType]],
      applyTerm(
        varTerm('f', joinType),
        varTerm('x', StringType),
        varTerm('y', StringType)))

    const appFunc = evalTerm(appTerm)
    assert.equals(appFunc.apply(joinFunc, 'foo', 'bar'), '(foo bar)')

    assert.end()
  })
})

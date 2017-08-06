import test from 'tape'

import {
  IntType
} from '../../../lib/simple/prelude/primitive'

import {
  arrowType
} from '../../../lib/simple/type/arrow'

import {
  valueTerm
} from '../../../lib/simple/term/value'

import {
  evalTerm
} from '../../../lib/simple/term/eval'

import {
  isClosure
} from '../../../lib/simple/closure/closure'

import {
  nil, valueNode, iterToNode
} from '../../../lib/container'

import {
  simpleArrowFunction,
} from '../../../lib/simple/arrow'

test('value term test', assert => {
  assert.test('Int value', assert => {
    const threeTerm = valueTerm(IntType, 3)

    assert.equals(threeTerm.freeTermVariables().size, 0)
    assert.equals(threeTerm.termType(), IntType)

    const threeClosure = threeTerm.compileClosure(nil)
    assert.ok(isClosure(threeClosure))

    assert.equals(threeClosure.bindValues(nil), 3)

    assert.throws(() => threeClosure.bindApplyArgs(nil, valueNode(2)))

    assert.equals(evalTerm(threeTerm), 3)

    assert.throws(() => valueTerm(IntType, 'foo'))

    assert.end()
  })

  assert.test('Arrow value', assert => {
    const plusType = arrowType(IntType, IntType, IntType)

    const plusFunc = simpleArrowFunction(
      [IntType, IntType],
      IntType,
      (a, b) => a+b)

    const plusTerm = valueTerm(plusType, plusFunc)

    assert.equals(evalTerm(plusTerm), plusFunc)

    const plusClosure = plusTerm.compileClosure(nil)

    assert.equals(plusClosure.bindApplyArgs(
      nil, iterToNode([1, 2])), 3)

    const onePlusFunc = plusClosure.bindApplyArgs(nil, valueNode(1))

    assert.equals(onePlusFunc.apply(2), 3)
    assert.equals(onePlusFunc.apply(3), 4)

    assert.end()
  })
})

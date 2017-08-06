import test from 'tape'

import { varTerm } from '../../../lib/simple/term/variable'

import {
  nil, valueNode, iterToNode
} from '../../../lib/container'

import {
  IntType
} from '../../../lib/simple/prelude/primitive'

import {
  arrowType
} from '../../../lib/simple/type/arrow'

import {
  simpleArrowFunction,
} from '../../../lib/simple/arrow'

test('VariableTerm test', assert => {
  assert.test('Int var', assert => {
    const xTerm = varTerm('x', IntType)

    assert.equals(xTerm.termType(), IntType)

    assert.deepEquals([...xTerm.freeTermVariables()], ['x'])

    const closure1 = xTerm.compileClosure(valueNode('x'))
    assert.equals(closure1.bindValues(valueNode(1)), 1)
    assert.equals(closure1.bindValues(valueNode(2)), 2)
    assert.equals(closure1.bindValues(valueNode('foo')), 'foo',
      'Closure do not do type checking when binding values')

    assert.throws(() => closure1.bindValues(nil))

    const closure2 = xTerm.compileClosure(iterToNode(['w', 'x', 'y']))
    assert.equals(closure2.bindValues(iterToNode([1, 2, 3])), 2)

    assert.throws(() => closure2.bindValues(valueNode(1)))

    assert.throws(() => xTerm.compileClosure(nil))
    assert.throws(() => xTerm.compileClosure(valueNode('y')))
    assert.throws(() => xTerm.compileClosure(iterToNode(['a', 'b'])))

    assert.end()
  })

  assert.test('arrow var', assert => {
    const plusType = arrowType(IntType, IntType, IntType)

    const plusFunc = simpleArrowFunction(
      [IntType, IntType],
      IntType,
      (a, b) => a+b)

    const pTerm = varTerm('p', plusType)
    const closure = pTerm.compileClosure(valueNode('p'))

    assert.equals(
      closure.bindApplyArgs(
        valueNode(plusFunc),
        iterToNode([1, 2])),
      3)

    const onePlus = closure.bindApplyArgs(
      valueNode(plusFunc),
      valueNode(1))

    assert.equals(onePlus.apply(3), 4)
    assert.equals(onePlus.apply(4), 5)

    assert.end()
  })
});

import test from 'tape'

import {
  IntegerType, StringType, NatType
} from '../../../lib/simple/prelude/primitive'

import {
  buildArrayType, buildNodeType
} from '../../../lib/simple/prelude/composite'

import {
  cons, nil, valueNode, iterToNode,
} from '../../../lib/container'

test('composite type test', assert => {
  assert.test('IntArrayType', assert => {
    const IntArrayType = buildArrayType(IntegerType)

    assert.notOk(IntArrayType.checkValue([]))
    assert.notOk(IntArrayType.checkValue([0, 1, -1, 2]))

    assert.ok(IntArrayType.checkValue([0, 1, 3.1416]))
    assert.ok(IntArrayType.checkValue([0, 'foo', 2]))
    assert.ok(IntArrayType.checkValue([null, 0, 1]))
    assert.ok(IntArrayType.checkValue([{}, 1, 2]))
    assert.ok(IntArrayType.checkValue({}))
    assert.ok(IntArrayType.checkValue(null))
    assert.ok(IntArrayType.checkValue('foo'))
    assert.ok(IntArrayType.checkValue(123))

    assert.end()
  })

  assert.test('StringArrayType', assert => {
    const StringArrayType = buildArrayType(StringType)

    assert.notOk(StringArrayType.checkValue([]))
    assert.notOk(StringArrayType.checkValue(['foo', 'bar', 'baz']))

    assert.ok(StringArrayType.checkValue(['foo', 'bar', 1]))
    assert.ok(StringArrayType.checkValue([null, 'bar']))
    assert.ok(StringArrayType.checkValue(['foo', {}]))
    assert.ok(StringArrayType.checkValue(['foo',, 'bar']))
    assert.ok(StringArrayType.checkValue({}))
    assert.ok(StringArrayType.checkValue(null))
    assert.ok(StringArrayType.checkValue('foo'))
    assert.ok(StringArrayType.checkValue(123))

    assert.end()
  })

  assert.test('NatNodeType', assert => {
    const NatNodeType = buildNodeType(NatType)

    assert.notOk(NatNodeType.checkValue(nil))
    assert.notOk(NatNodeType.checkValue(valueNode(1)))
    assert.notOk(NatNodeType.checkValue(valueNode(0)))
    assert.notOk(NatNodeType.checkValue(cons(0, cons(1, nil))))
    assert.notOk(NatNodeType.checkValue(iterToNode([0, 1, 2])))

    assert.ok(NatNodeType.checkValue(iterToNode([-1, 0, 1])))
    assert.ok(NatNodeType.checkValue(iterToNode([0, 1, 3.1416])))
    assert.ok(NatNodeType.checkValue(iterToNode([0, 'foo', 2])))
    assert.ok(NatNodeType.checkValue(iterToNode([, 1, 2])))

    assert.ok(NatNodeType.checkValue(null))
    assert.ok(NatNodeType.checkValue({}))
    assert.ok(NatNodeType.checkValue([1, 2, 3]))

    assert.end()
  })
})

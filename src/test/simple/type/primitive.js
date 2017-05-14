import test from 'tape'

import {
  NumberType, NatType
} from '../../../lib/simple/prelude/primitive'

test('primitive type test', assert => {
  assert.test('NumberType', assert => {
    assert.notOk(NumberType.checkValue(1))
    assert.notOk(NumberType.checkValue(-1))
    assert.notOk(NumberType.checkValue(100))
    assert.notOk(NumberType.checkValue(3.1416))
    assert.notOk(NumberType.checkValue(-3.1416))
    assert.notOk(NumberType.checkValue(NaN))
    assert.notOk(NumberType.checkValue(Infinity))

    assert.ok(NumberType.checkValue(null))
    assert.ok(NumberType.checkValue(undefined))
    assert.ok(NumberType.checkValue('foo'))
    assert.ok(NumberType.checkValue({}))

    assert.end()
  })

  assert.test('NatType', assert => {
    assert.notOk(NatType.checkValue(0))
    assert.notOk(NatType.checkValue(1))
    assert.notOk(NatType.checkValue(2))
    assert.notOk(NatType.checkValue(100))

    assert.ok(NatType.checkValue(-1))
    assert.ok(NatType.checkValue(-100))
    assert.ok(NatType.checkValue(3.1416))
    assert.ok(NatType.checkValue(-3.1416))
    assert.ok(NatType.checkValue(NaN))
    assert.ok(NatType.checkValue(Infinity))

    assert.end()
  })
})

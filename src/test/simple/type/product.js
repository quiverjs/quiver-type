import test from 'tape'
import { productType } from '../../../lib/simple/type/product'
import { typedTuple } from '../../../lib/simple/value/tuple'
import {
  NumberType, StringType
} from '../../../lib/simple/prelude/primitive'

test('product type test', assert => {
  assert.test('invalid product type', assert => {
    assert.throws(() => productType())
    assert.throws(() => productType('foo'))
    assert.throws(() => typedTuple())
    assert.throws(() => typedTuple('foo', 'bar'))
    assert.end()
  })

  assert.test('basic product type', assert => {
    const NumStrType = productType(NumberType, StringType)

    const tuple = typedTuple(NumStrType, 3, 'foo')
    assert.notOk(NumStrType.checkValue(tuple))

    assert.throws(() => typedTuple(NumStrType, 'foo', 'bar'))
    assert.throws(() => typedTuple(NumStrType, 3, 2))
    assert.throws(() => typedTuple(NumStrType, 'foo', 3))
    assert.throws(() => typedTuple(NumStrType, 3, 'foo', 'bar'))

    assert.end()
  })
})

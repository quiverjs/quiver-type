import test from 'tape'

import { productType } from '../../../lib/simple/type/product'
import { productTerm } from '../../../lib/simple/term/product'
import { valueTerm } from '../../../lib/simple/term/value'
import { isTypedTuple } from '../../../lib/simple/value/tuple'
import { evalTerm } from '../../../lib/simple/term/eval'

import {
  StringType, IntType
} from '../../../lib/simple/prelude/primitive'

test('ProductTerm test', assert => {
  assert.test('basic tuple', assert => {
    const IntStrType = productType(IntType, StringType)

    const intTerm = valueTerm(IntType, 3)
    const strTerm = valueTerm(StringType, 'foo')

    const testTerm = productTerm(intTerm, strTerm)

    assert.notOk(IntStrType.checkTerm(testTerm))

    const tuple = evalTerm(testTerm)

    assert.true(isTypedTuple(tuple))
    assert.deepEquals([...tuple], [3, 'foo'])

    assert.end()
  })
})

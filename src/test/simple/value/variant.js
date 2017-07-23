import test from 'tape'

import { sumType } from '../../../lib/simple/type/sum'
import { variantValue } from '../../../lib/simple/value/variant'
import { IntType, StringType } from '../../../lib/simple/prelude/primitive'

test('sum type test', assert => {
  assert.test('basic test', assert => {
    const EitherStrInt = sumType({
      Left: StringType,
      Right: IntType
    })

    const left1 = variantValue(EitherStrInt, 'Left', 'foo')
    assert.notOk(EitherStrInt.checkValue(left1))

    const right1 = variantValue(EitherStrInt, 'Right', 2)
    assert.notOk(EitherStrInt.checkValue(right1))

    assert.throws(() => variantValue(EitherStrInt, 'Invalid', 'blah'))
    assert.throws(() => variantValue(EitherStrInt, 'Left', 2))
    assert.throws(() => variantValue(EitherStrInt, 'Right', 'foo'))

    assert.end()
  })
})

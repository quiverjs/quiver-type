import test from 'tape'

import { sumType } from '../../../lib/simple/type/sum'
import { variantValue } from '../../../lib/simple/value/variant'
import { IntType, StringType } from '../../../lib/simple/prelude/primitive'

test('sum type test', assert => {
  assert.test('basic test', assert => {
    const EitherStrInt = sumType({
      left: StringType,
      right: IntType
    })

    const left1 = variantValue(EitherStrInt, 'left', 'foo')
    assert.notOk(EitherStrInt.checkValue(left1))

    const right1 = variantValue(EitherStrInt, 'right', 2)
    assert.notOk(EitherStrInt.checkValue(right1))

    assert.throws(() => variantValue(EitherStrInt, 'invalid', 'blah'))
    assert.throws(() => variantValue(EitherStrInt, 'left', 2))
    assert.throws(() => variantValue(EitherStrInt, 'right', 'foo'))

    assert.end()
  })
})

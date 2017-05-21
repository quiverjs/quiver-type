import test from 'tape'

import { sumType } from '../../../lib/simple/type/sum'
import { variantValue } from '../../../lib/simple/value/variant'
import { matcherValue } from '../../../lib/simple/arrow/matcher'
import { IntType, StringType } from '../../../lib/simple/prelude/primitive'

test('matcher arrow value test', assert => {
  assert.test('basic test', assert => {
    const EitherStrInt = sumType({
      left: StringType,
      right: IntType
    })

    const matchStrInt = matcherValue(EitherStrInt, StringType, {
      left: str => `str(${str})`,
      right: int => `int(${int})`
    })

    const left1 = variantValue(EitherStrInt, 'left', 'foo')
    assert.equals(matchStrInt.apply(left1), 'str(foo)')

    const right1 = variantValue(EitherStrInt, 'right', 2)
    assert.equals(matchStrInt.apply(right1), 'int(2)')

    assert.end()
  })
})

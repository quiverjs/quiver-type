import test from 'tape'

import { recursiveType } from '../../../lib/simple/type/abstract'
import { abstractDataType, adtValue } from '../../../lib/simple/dsl/adt'
import { NumberType } from '../../../lib/simple/prelude/primitive'
import { unitType } from '../../../lib/simple/type/unit'

test('recursive type test', assert => {
  assert.test('basic list', assert => {
    const NumberList = recursiveType(t =>
      abstractDataType({
        Nil: unitType,
        Cons: [NumberType, t]
      }))

    const nil = adtValue(NumberList, 'Nil', null)
    assert.notOk(NumberList.checkValue(nil))

    const single = adtValue(NumberList, 'Cons',
      [3, nil])

    assert.notOk(NumberList.checkValue(single))

    const double = adtValue(NumberList, 'Cons',
      [2, single])

    assert.notOk(NumberList.checkValue(double))

    assert.end()
  })
})

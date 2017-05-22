import test from 'tape'
import { typedRecord } from '../../../lib/simple/value/record'
import { recordType } from '../../../lib/simple/type/record'
import {
  recordFromObject, recordFromEntries
} from '../../../lib/container'
import {
  IntType, StringType
} from '../../../lib/simple/prelude/primitive'

test('record value test', assert => {
  assert.test('basic test', assert => {
    const IntStrPair = recordType({
      first: IntType,
      second: StringType
    })

    const record1 = recordFromObject({
      first: 1,
      second: 'foo'
    })

    assert.notOk(IntStrPair.checkValueRecord(record1))

    const record2 = recordFromObject({
      first: 'foo',
      second: 1
    })

    assert.ok(IntStrPair.checkValueRecord(record2))

    const record3 = recordFromObject({
      second: 'foo',
      first: 1
    })

    assert.ok(IntStrPair.checkValueRecord(record3),
      'should not type check when field order is different')

    const record4 = recordFromEntries([
      ['second', 'foo'],
      ['first', 1]
    ])

    assert.ok(IntStrPair.checkValueRecord(record4),
      'should not type check when field order is different')

    const typedRecord1 = typedRecord(IntStrPair, record1)
    assert.notOk(IntStrPair.checkValue(typedRecord1))

    const typedRecord2 = typedRecord1.set('second', 'bar')
    assert.equals(typedRecord1.get('second'), 'foo')
    assert.equals(typedRecord2.get('second'), 'bar')

    assert.throws(() => typedRecord.set('first', 'foo'))
    assert.throws(() => typedRecord(IntStrPair, record2))

    assert.end()
  })
})

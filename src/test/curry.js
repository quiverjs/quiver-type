import test from 'tape'
import { iterToNode } from '../lib/container/algo/iter'
import { currifyFunction, nestedCurrifyFunction } from '../lib/simple/arrow/curry'

test('curry function test', assert => {
  const func1 = (a, b, c) =>
    [a, b, c]

  const curriedFunc1 = currifyFunction(func1, 3)
  assert.deepEqual(curriedFunc1(1)(2)(3), [1, 2, 3])

  const func2 = x => x
  const curriedFunc2 = currifyFunction(func2, 1)
  assert.equal(curriedFunc2(1), 1)

  const func3 = (a, b) =>
    [a, b]

  const curriedFunc3 = currifyFunction(func3, 2)
  assert.deepEqual(curriedFunc3(1)(2), [1, 2])

  const func4 = (a, b) => (c, d, e) => f =>
    [a, b, c, d, e, f]

  const curriedFunc4 = nestedCurrifyFunction(func4,
    iterToNode([2, 3, 1][Symbol.iterator]()))

  assert.deepEqual(curriedFunc4(1)(2)(3)(4)(5)(6),
    [1, 2, 3, 4, 5, 6])

  assert.end()
})

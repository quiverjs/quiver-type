import test from 'tape'

import {
  arrow
} from '../../../lib/simple/type/arrow'

import {
  FunctionValue,
  simpleArrowFunction,
} from '../../../lib/simple/arrow'

import {
  iterToNode, valueNode
} from '../../../lib/container'

import {
  IntType
} from '../../../lib/simple/prelude/primitive'

test('arrow value test', assert => {
  assert.test('raw plus', assert => {
    const PlusType = arrow(IntType, IntType, IntType)

    const plusFunc = a => b => (a+b)

    const plusValue = new FunctionValue(PlusType, 2, plusFunc)

    assert.notOk(PlusType.checkValue(plusValue))

    assert.equals(plusValue.apply(1, 2), 3)
    assert.equals(plusValue.apply(1, -5), -4)

    assert.throws(() => plusValue.apply(1, 3.1416))
    assert.throws(() => plusValue.apply(1, 'foo'))
    assert.throws(() => plusValue.apply(1))
    assert.throws(() => plusValue.apply())
    assert.throws(() => plusValue.apply(1, 2, 3))

    const adder = plusValue.applyPartial(1)
    const AdderType = arrow(IntType, IntType)
    assert.notOk(AdderType.checkValue(adder))

    assert.equals(adder.apply(2), 3)
    assert.equals(adder.apply(-5), -4)

    assert.throws(() => adder.apply(3.1416))
    assert.throws(() => adder.apply('foo'))
    assert.throws(() => adder.apply(null))
    assert.throws(() => adder.apply())

    assert.equals(plusValue.applyPartial(), plusValue)
    assert.throws(() => plusValue.applyPartial('foo'))
    assert.throws(() => plusValue.applyPartial(1, 2, 3))

    assert.equals(plusValue.applyPartial(1, 2), 3)
    assert.equals(plusValue.applyPartial(1, -5), -4)

    assert.equals(plusValue.$apply(iterToNode([1.2, 3.6])), 4.8)
    assert.equals(plusValue.$apply(iterToNode(['foo', 'bar'])), 'foobar')
    assert.equals(plusValue.$apply(valueNode('foo')).$apply(valueNode('bar')), 'foobar')

    assert.throws(() => plusValue.$apply(iterToNode([1, 2, 3])))

    assert.end()
  })

  assert.test('wrapped mult', assert => {
    const MultType = arrow(IntType, IntType, IntType)
    const rawMult = (a, b) => (a*b)

    const mult = simpleArrowFunction(
      [IntType, IntType],
      IntType,
      rawMult)

    assert.notOk(MultType.checkValue(mult))

    assert.equals(mult.apply(2, 3), 6)
    assert.equals(mult.apply(3, 4), 12)

    assert.throws(() => mult.apply(1, 3.1416))
    assert.throws(() => mult.apply(1, 'foo'))
    assert.throws(() => mult.apply(1))
    assert.throws(() => mult.apply())
    assert.throws(() => mult.apply(1, 2, 3))

    const twice = mult.applyPartial(2)

    assert.equals(twice.apply(3), 6)
    assert.equals(twice.apply(4), 8)

    assert.throws(() => twice.apply(0.2))
    assert.throws(() => twice.apply('foo'))

    assert.equals(mult.$apply(iterToNode([5, 0.2])), 1)

    // throw because return value 0.8 is invalid
    assert.throws(() => mult.$apply(iterToNode([4, 0.2])))

    assert.end()
  })

  assert.test('invalid wrap', assert => {
    const MultType = arrow(IntType, IntType, IntType)

    // forgot currify
    const mult = new FunctionValue(MultType, 2,
      (a, b) => (a*b))

    assert.throws(() => mult.partialApply(1))
    assert.throws(() => mult.partialApply(1, 2))
    assert.throws(() => mult.apply(1, 2))

    assert.end()
  })

  assert.test('nested wrap', assert => {
    const AdderType = arrow(IntType, IntType)

    const add = simpleArrowFunction(
      [IntType, IntType],
      IntType,
      (a, b) => (a+b))

    const addATwice = simpleArrowFunction(
      [IntType],
      AdderType,
      a => add.applyPartial(a*2))

    assert.equals(addATwice.apply(2, 3), 7)
    assert.equals(addATwice.apply(3, 4), 10)

    const fourAdder = addATwice.applyPartial(2)

    assert.equals(fourAdder.apply(3), 7)
    assert.equals(fourAdder.apply(5), 9)

    assert.throws(() => addATwice.apply(2))
    assert.throws(() => addATwice.apply('foo', 2))
    assert.throws(() => addATwice.apply(2, 'foo'))
    assert.throws(() => fourAdder.apply('foo'))

    assert.end()
  })
})

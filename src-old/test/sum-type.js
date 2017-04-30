import test from 'tape'

import {
  body, varTerm, varType,
  match, when, variant,
  value, lambda,
  forall, sumType, typeApp,
  unitKind, arrowKind,
  compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

test('sum type test', assert => {
  assert.test('basic sum type', assert => {
    const aType = varType('a', unitKind)
    const bType = varType('b', unitKind)

    // Either = forall a b. a | b
    const EitherType = forall(
      [['a', unitKind],
       ['b', unitKind]],
      sumType({
        Left: aType,
        Right: bType
      }))

    // EitherNumStr = Number | String
    const EitherNumStr = typeApp(
      EitherType, NumberType, StringType)

    const numVariantTerm = variant(
      EitherNumStr, 'Left',
      value(3, NumberType))

    const matchLambda = lambda(
      [['x', EitherNumStr]],
      match(
        varTerm('x', EitherNumStr),
        StringType,

        when(EitherNumStr, 'Left', 'num',
          body(
            [varTerm('num', NumberType)],
            StringType,
            num => `num(${num})`)),

        when(EitherNumStr, 'Right', 'str',
          body(
            [varTerm('str', StringType)],
            StringType,
            str => `str(${str})`))))

    const matchNumTerm = matchLambda.applyTerm(numVariantTerm)
    assert.equals(compile(matchNumTerm), 'num(3)')

    const compiledEitherNumStr = EitherNumStr.compileType()

    const matchFn = compile(matchLambda)

    const numVariant = compile(numVariantTerm)

    assert.equals(matchFn.call(numVariant), 'num(3)')

    const strVariant = compiledEitherNumStr.construct('Right', 'foo')

    assert.equals(matchFn.call(strVariant), 'str(foo)')

    assert.end()
  })

  assert.test('error sum types', assert => {
    assert.throws(() => {
      sumType({
        Left: NumberType,
        Right: varType('a', arrowKind(unitKind, unitKind))
      })
    }, 'should not allow non unit kind in sum type member')

    const EitherNumStr = sumType({
      Left: NumberType,
      Right: StringType
    })

    assert.throws(() => {
      match(
        varTerm('x', EitherNumStr),
        StringType,

        when(EitherNumStr, 'Left', 'num',
          body(
            [varTerm('num', NumberType)],
            StringType,
            num => `num(${num})`)))

    }, 'should not allow match term that doesn\'t match all cases')

    assert.throws(() => {
      match(
        varTerm('x', EitherNumStr),
        StringType,

        when(EitherNumStr, 'foo', 'num',
          body(
            [varTerm('num', NumberType)],
            StringType,
            num => `num(${num})`)),

        when(EitherNumStr, 'bar', 'str',
          body(
            [varTerm('str', StringType)],
            StringType,
            str => `str(${str})`)))

    }, 'should not allow match term that have wrong variant tags')

    assert.throws(() => {
      match(
        varTerm('x', EitherNumStr),
        StringType,

        when(EitherNumStr, 'Left', 'num',
          body(
            [varTerm('num', NumberType)],
            NumberType,
            num => num)),

        when(EitherNumStr, 'Right', 'str',
          body(
            [varTerm('str', StringType)],
            StringType,
            str => `str(${str})`)))

    }, 'should not allow match term with mismatched return type')

    assert.end()
  })
})

import test from 'tape'

import {
  varGen, body, match,
  value, variant, lambda,
  forall, sumType, typeApp,
  unitKind, arrowKind,
  functionTerm, compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

test('sum type test', assert => {
  assert.test('basic sum type', assert => {
    const { termVar, typeVar, varTerm, varType } = varGen()

    const aType = varType('a', unitKind)
    const bType = varType('b', unitKind)

    // Either = forall a b. a | b
    const EitherType = forall(
      [[typeVar('a'), unitKind],
       [typeVar('b'), unitKind]],
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
      [[termVar('x'), EitherNumStr]],
      match(
        varTerm('x', EitherNumStr),
        StringType,
        {
          Left: functionTerm(
            [NumberType],
            StringType,
            x => `num(${x})`),
          Right: functionTerm(
            [StringType],
            StringType,
            x => `str(${x})`)
        }))

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
    const { varTerm, varType } = varGen()

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
        {
          Left: functionTerm(
            [NumberType],
            StringType,
            x => `num(${x})`)
        })
    }, 'should not allow match term that doesn\'t match all cases')

    assert.throws(() => {
      match(
        varTerm('x', EitherNumStr),
        StringType,
        {
          foo: functionTerm(
            [NumberType],
            StringType,
            x => `num(${x})`),
          bar: functionTerm(
            [StringType],
            StringType,
            x => `str(${x})`)
        })
    }, 'should not allow match term that have wrong variant tags')

    assert.throws(() => {
      match(
        varTerm('x', EitherNumStr),
        StringType,
        {
          Left: functionTerm(
            [StringType],
            StringType,
            x => `num(${x})`),
          Right: functionTerm(
            [NumberType],
            StringType,
            x => `str(${x})`)
        })
    }, 'should not allow match term with wrong lambda type in tag')

    assert.throws(() => {
      match(
        varTerm('x', EitherNumStr),
        StringType,
        {
          Left: functionTerm(
            [NumberType],
            StringType,
            x => `num(${x})`),
          Right: functionTerm(
            [StringType],
            NumberType,
            x => `str(${x})`)
        })
    }, 'should not allow match term with mismatched return type')

    assert.throws(() => {
      match(
        varTerm('x', EitherNumStr),
        StringType,
        {
          Left: functionTerm(
            [NumberType],
            StringType,
            x => `num(${x})`),
          Right: body(
            [varTerm('x', NumberType)],
            StringType,
            x => `str(${x})`)
        })
    }, 'should not allow match term with non lambda term case handler')

    assert.end()
  })
})

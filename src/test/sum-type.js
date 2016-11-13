import test from 'tape'

import {
  IMap, IList,
  TermVariable, TypeVariable
} from '../lib/core'

import {
  BodyTerm,
  MatchTerm,
  ValueTerm,
  VariantTerm,
  VariableTerm,
  TermLambdaTerm
} from '../lib/term'

import {
  VariableType,
  ForAllType,
  SumType,
  ApplicationType
} from '../lib/type'

import {
  unitKind, ArrowKind
} from '../lib/kind'

import {
  functionToTerm, compileTerm
} from '../lib/util'

import {
  NumberType, StringType, termTypeEquals, typeKindEquals
} from './util'

test('sum type test', assert => {
  assert.test('basic sum type', assert => {
    const aTVar = new TypeVariable('a')
    const bTVar = new TypeVariable('b')

    const aType = new VariableType(aTVar, unitKind)
    const bType = new VariableType(bTVar, unitKind)

    // Either = forall a b. a | b
    const EitherType = new ForAllType(
      aTVar, unitKind,
      new ForAllType(
        bTVar, unitKind,
        new SumType(IMap({
          Left: aType,
          Right: bType
        }))))

    // EitherNumStr = Number | String
    const EitherNumStr = new ApplicationType(
      new ApplicationType(
        EitherType, NumberType),
      StringType)

    const numVariantTerm = new VariantTerm(
      EitherNumStr, 'Left',
      new ValueTerm(3, NumberType))

    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const matchLambda = new TermLambdaTerm(
      xVar, EitherNumStr,
      new MatchTerm(
        new VariableTerm(xVar, EitherNumStr),
        StringType,
        IMap({
          Left: functionToTerm(
            IList([NumberType]),
            StringType,
            x => `num(${x})`),
          Right: functionToTerm(
            IList([StringType]),
            StringType,
            x => `str(${x})`)
        })))

    const matchNumTerm = matchLambda.applyTerm(numVariantTerm)
    assert.equals(compileTerm(matchNumTerm), 'num(3)')

    const compiledEitherNumStr = EitherNumStr.compileType()

    const matchFn = compileTerm(matchLambda)

    const numVariant = compileTerm(numVariantTerm)

    assert.equals(matchFn.call(numVariant), 'num(3)')

    const strVariant = compiledEitherNumStr.construct('Right', 'foo')

    assert.equals(matchFn.call(strVariant), 'str(foo)')

    assert.end()
  })

  assert.test('error sum types', assert => {
    assert.throws(() => {
      const invalidSumType = new SumType(IMap({
        Left: NumberType,
        Right: new VariableType(
          new TypeVariable('a'),
          new ArrowKind(unitKind, unitKind))
      }))
    }, 'should not allow non unit kind in sum type member')

    const EitherNumStr = new SumType(IMap({
      Left: NumberType,
      Right: StringType
    }))

    const xVar = new TermVariable('x')

    assert.throws(() => {
      const invalidMatch = new MatchTerm(
        new VariableTerm(xVar, EitherNumStr),
        StringType,
        IMap({
          Left: functionToTerm(
            IList([NumberType]),
            StringType,
            x => `num(${x})`)
        }))
    }, 'should not allow match term that doesn\'t match all cases')

    assert.throws(() => {
      const invalidMatch = new MatchTerm(
        new VariableTerm(xVar, EitherNumStr),
        StringType,
        IMap({
          foo: functionToTerm(
            IList([NumberType]),
            StringType,
            x => `num(${x})`),
          bar: functionToTerm(
            IList([StringType]),
            StringType,
            x => `str(${x})`)
        }))
    }, 'should not allow match term that have wrong variant tags')

    assert.throws(() => {
      const invalidMatch = new MatchTerm(
        new VariableTerm(xVar, EitherNumStr),
        StringType,
        IMap({
          Left: functionToTerm(
            IList([StringType]),
            StringType,
            x => `num(${x})`),
          Right: functionToTerm(
            IList([NumberType]),
            StringType,
            x => `str(${x})`)
        }))
    }, 'should not allow match term with wrong lambda type in tag')

    assert.throws(() => {
      const invalidMatch = new MatchTerm(
        new VariableTerm(xVar, EitherNumStr),
        StringType,
        IMap({
          Left: functionToTerm(
            IList([NumberType]),
            StringType,
            x => `num(${x})`),
          Right: functionToTerm(
            IList([StringType]),
            NumberType,
            x => `str(${x})`)
        }))
    }, 'should not allow match term with mismatched return type')

    assert.throws(() => {
      const invalidMatch = new MatchTerm(
        new VariableTerm(xVar, EitherNumStr),
        StringType,
        IMap({
          Left: functionToTerm(
            IList([NumberType]),
            StringType,
            x => `num(${x})`),
          Right: new BodyTerm(
            IList([
              new VariableTerm(xVar, NumberType),
            ]),
            StringType,
            () => x => `str(${x})`)
        }))
    }, 'should not allow match term with non lambda term case handler')

    assert.end()
  })
})

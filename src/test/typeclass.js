import test from 'tape'

import {
  IMap,
  TermVariable, TypeVariable
} from '../lib/core'

import {
  unitTerm,
  MatchTerm,
  RecordTerm,
  VariantTerm,
  VariableTerm,
  TypeLambdaTerm,
  TermLambdaTerm,
  TermApplicationTerm
} from '../lib/term'

import {
  SumType,
  unitType,
  ArrowType,
  ForAllType,
  RecordType,
  VariableType,
  ApplicationType
} from '../lib/type'

import {
  unitKind,
  ArrowKind
} from '../lib/kind'

import {
  NumberType, StringType,
  termTypeEquals
} from './util'

test('type class test', assert => {
  assert.test('basic functor', assert => {
    const aTVar = new TypeVariable('a')
    const bTVar = new TypeVariable('b')
    const kTVar = new TypeVariable('k')
    const fTVar = new TypeVariable('f')

    const arrowKind = new ArrowKind(unitKind, unitKind)

    const aType = new VariableType(aTVar, unitKind)
    const bType = new VariableType(bTVar, unitKind)
    const kType = new VariableType(kTVar, unitKind)
    const fType = new VariableType(fTVar, arrowKind)

    // Maybe = forall k. Just k | Nothing
    const MaybeType = new ForAllType(
      kTVar, unitKind,
      new SumType(IMap({
        Just: kType,
        Nothing: unitType
      })))

    // fmap = forall a b. (a -> b) -> f a -> f b
    const fmapType = new ForAllType(
      aTVar, unitKind,
      new ForAllType(
        bTVar, unitKind,
          new ArrowType(
            new ArrowType(aType, bType),
            new ArrowType(
              new ApplicationType(fType, aType),
              new ApplicationType(fType, bType)))))

    // Functor = forall f. { fmap }
    const FunctorClass = new ForAllType(
      fTVar, arrowKind,
      new RecordType(IMap({
        fmap: fmapType
      })))

    const xVar = new TermVariable('x')
    const mapVar = new TermVariable('map')
    const maybeAVar = new TermVariable('maybeA')

    const MaybeAType = new ApplicationType(MaybeType, aType)
    const MaybeBType = new ApplicationType(MaybeType, bType)
    const ABArrowType = new ArrowType(aType, bType)

    // maybeFmap =
    //   Lambda a b .
    //     lambda map maybeA .
    //       match maybeA
    //         Just x -> MaybeB.Just map x
    //         Nothing -> MaybeB.Nothing
    const maybeFmap = new TypeLambdaTerm(
      aTVar, unitKind,
      new TypeLambdaTerm(
        bTVar, unitKind,
        new TermLambdaTerm(
          mapVar, ABArrowType,
          new TermLambdaTerm(
            maybeAVar, MaybeAType,
            new MatchTerm(
              new VariableTerm(maybeAVar, MaybeAType),
              MaybeBType,
              IMap({
                Just: new TermLambdaTerm(
                  xVar, aType,
                  new VariantTerm(
                    MaybeBType,
                    'Just',
                    new TermApplicationTerm(
                      new VariableTerm(mapVar, ABArrowType),
                      new VariableTerm(xVar, aType)))),

                Nothing: new TermLambdaTerm(
                  xVar, unitType,
                  new VariantTerm(
                    MaybeBType,
                    'Nothing',
                    unitTerm))
              }))))))


    const MaybeFunctorClass = new ApplicationType(
      FunctorClass, MaybeType)

    const MaybeFunctorInstance = new RecordTerm(IMap({
      fmap: maybeFmap
    }))

    assert::termTypeEquals(MaybeFunctorInstance, MaybeFunctorClass)

    assert.end()
  })
})

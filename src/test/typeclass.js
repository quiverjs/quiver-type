import test from 'tape'

import {
  IMap, IList,
  TermVariable, TypeVariable
} from '../lib/core'

import {
  LetTerm,
  unitTerm,
  BodyTerm,
  unitValue,
  ValueTerm,
  MatchTerm,
  RecordTerm,
  VariantTerm,
  VariableTerm,
  TypeLambdaTerm,
  TermLambdaTerm,
  ValueLambdaTerm,
  ProjectRecordTerm,
  TermApplicationTerm,
  TypeApplicationTerm
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

import { compileTerm } from '../lib/util'

import {
  StringType, NumberType,
  termTypeEquals
} from './util'

test('type class test', assert => {
  assert.test('basic functor', assert => {
    const aTVar = new TypeVariable('a')
    const bTVar = new TypeVariable('b')
    const kTVar = new TypeVariable('k')
    const sTVar = new TypeVariable('s')
    const fTVar = new TypeVariable('f')

    const arrowKind = new ArrowKind(unitKind, unitKind)

    const aType = new VariableType(aTVar, unitKind)
    const bType = new VariableType(bTVar, unitKind)
    const kType = new VariableType(kTVar, unitKind)
    const sType = new VariableType(sTVar, unitKind)
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
        new ValueLambdaTerm(
          mapVar, ABArrowType,
          new ValueLambdaTerm(
            maybeAVar, MaybeAType,
            new MatchTerm(
              new VariableTerm(maybeAVar, MaybeAType),
              MaybeBType,
              IMap({
                Just: new ValueLambdaTerm(
                  xVar, aType,
                  new VariantTerm(
                    MaybeBType,
                    'Just',
                    new TermApplicationTerm(
                      new VariableTerm(mapVar, ABArrowType),
                      new VariableTerm(xVar, aType)))),

                Nothing: new ValueLambdaTerm(
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

    const showType = new ArrowType(sType, StringType)

    const ShowClass = new ForAllType(
      sTVar, unitKind,
      new RecordType(IMap({
        show: showType
      })))

    const showAVar = new TermVariable('showA')
    const showAType = new ApplicationType(ShowClass, aType)

    const StringShowClass = new ApplicationType(
      ShowClass, StringType)

    const StringShowInstance = new RecordTerm(IMap({
      show: new ValueLambdaTerm(
        xVar, StringType,
        new BodyTerm(
          IList([
            new VariableTerm(xVar, StringType)
          ]),
          StringType,
          (CompiledStrinType) =>
            str => `str(${str})`))
    }))

    assert::termTypeEquals(StringShowInstance, StringShowClass)

    const NumberShowClass = new ApplicationType(
      ShowClass, NumberType)

    const NumberShowInstance = new RecordTerm(IMap({
      show: new ValueLambdaTerm(
        xVar, NumberType,
        new BodyTerm(
          IList([
            new VariableTerm(xVar, NumberType)
          ]),
          StringType,
          (CompiledNumberType) =>
            num => `num(${num})`))
    }))

    assert::termTypeEquals(NumberShowInstance, NumberShowClass)

    const MaybeNum = new ApplicationType(
      MaybeType, NumberType)

    const CompiledMaybeNum = MaybeNum.compileType()

    assert.test('maybe show 1', assert => {
      const MaybeShowClass = new ForAllType(
        aTVar, unitKind,
        new ApplicationType(
          ShowClass,
          new ApplicationType(
            MaybeType, aType)))

      const maVar = new TermVariable('ma')
      const xStrVar = new TermVariable('xStr')

      // MaybeShowInstance =
      //   Λ a :: * .
      //     λ showA : Show a .
      //       show : Maybe a -> String
      //       show ma = match ma
      //         Just x: `Just ${ showA.show x }`
      //         Nothing: 'Nothing'
      const MaybeShowInstance = new TypeLambdaTerm(
        aTVar, unitKind,
        new ValueLambdaTerm(
          showAVar, showAType,
          new RecordTerm(IMap({
            show: new ValueLambdaTerm(
              maVar, MaybeAType,
              new MatchTerm(
                new VariableTerm(maVar, MaybeAType),
                StringType,
                IMap({
                  Just: new ValueLambdaTerm(
                    xVar, aType,
                    new LetTerm(
                      xStrVar,

                      new TermApplicationTerm(
                        new ProjectRecordTerm(
                          new VariableTerm(
                            showAVar, showAType),
                          'show'),
                        new VariableTerm(xVar, aType)),

                      new BodyTerm(
                        IList([
                          new VariableTerm(xStrVar, StringType)
                        ]),
                        StringType,
                        stringCompiledType =>
                          xStr =>
                            `Just(${xStr})`
                      ))),

                  Nothing: new ValueLambdaTerm(
                    xVar, unitType,
                    new ValueTerm('Nothing', StringType))
                }))),
          }))))

      const MaybeStringShowInstance = new TermApplicationTerm(
        new TypeApplicationTerm(
          MaybeShowInstance, StringType),
        StringShowInstance)

      const showMaybeStr = compileTerm(MaybeStringShowInstance).get('show')

      const MaybeString = new ApplicationType(
        MaybeType, StringType)

      const CompiledMaybeStr = MaybeString.compileType()

      const justFoo = CompiledMaybeStr.construct('Just', 'foo')
      assert.equals(showMaybeStr.call(justFoo), 'Just(str(foo))')

      const nothingStr = CompiledMaybeStr.construct('Nothing', unitValue)
      assert.equals(showMaybeStr.call(nothingStr), 'Nothing')

      const MaybeNumShowInstance = new TermApplicationTerm(
        new TypeApplicationTerm(
          MaybeShowInstance, NumberType),
        NumberShowInstance)

      const showMaybeNum = compileTerm(MaybeNumShowInstance).get('show')

      const justOne = CompiledMaybeNum.construct('Just', 1)
      assert.equals(showMaybeNum.call(justOne), 'Just(num(1))')

      const nothingNum = CompiledMaybeNum.construct('Nothing', unitValue)
      assert.equals(showMaybeNum.call(nothingNum), 'Nothing')

      assert.throws(() => showMaybeNum.call(nothingStr))

      assert.end()
    })

    assert.test('Maybe show 2', assert => {
      const functorFVar = new TermVariable('functorF')
      const functorFType = new ApplicationType(FunctorClass, fType)

      // fmapShow =
      //   Λ f :: * -> * .
      //   Λ a :: * .
      //     λ showA : Show a .
      //     λ functorF : Functor f .
      //       functorF.fmap [a, String] showA.show

      const fmapShow = new TypeLambdaTerm(
        fTVar, arrowKind,
        new TypeLambdaTerm(
          aTVar, unitKind,
          new TermLambdaTerm(
            showAVar, showAType,
            new TermLambdaTerm(
              functorFVar, functorFType,
              new TermApplicationTerm(
                new TypeApplicationTerm(
                  new TypeApplicationTerm(
                    new ProjectRecordTerm(
                      new VariableTerm(functorFVar, functorFType),
                      'fmap'),
                    aType),
                  StringType),
                new ProjectRecordTerm(
                  new VariableTerm(showAVar, showAType),
                  'show'))))))

      const fmapShowMaybeNumTerm = new TermApplicationTerm(
        new TermApplicationTerm(
          new TypeApplicationTerm(
            new TypeApplicationTerm(
              fmapShow, MaybeType),
            NumberType),
          NumberShowInstance),
        MaybeFunctorInstance)

      const fmapShowMaybeNum = compileTerm(fmapShowMaybeNumTerm)

      const justOne = CompiledMaybeNum.construct('Just', 1)

      const justOneStr = fmapShowMaybeNum.call(justOne)

      assert.equals(justOneStr.tag, 'Just')
      assert.equals(justOneStr.value, 'num(1)')

      assert.end()
    })

    assert.end()
  })
})

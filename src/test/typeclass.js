import test from 'tape'

import {
  termVar, typeVar,
  lets, body,
  unit, unitTerm,
  value, match, record,
  variant, varTerm,
  lambda, typeLambda,
  termLambda,
  projectRecord,
  apply, applyType,
  sumType, unitType,
  arrow, forall,
  recordType, varType,
  applicationType,
  unitKind, arrowKind
} from '../lib/dsl'

import { compileTerm } from '../lib/util'

import { NumberType, StringType } from '../lib/builtin'

import { termTypeEquals } from './util'

test('type class test', assert => {
  assert.test('basic functor', assert => {
    const aTVar = typeVar('a')
    const bTVar = typeVar('b')
    const kTVar = typeVar('k')
    const sTVar = typeVar('s')
    const fTVar = typeVar('f')

    const unitArrow = arrowKind(unitKind, unitKind)

    const aType = varType(aTVar, unitKind)
    const bType = varType(bTVar, unitKind)
    const kType = varType(kTVar, unitKind)
    const sType = varType(sTVar, unitKind)
    const fType = varType(fTVar, unitArrow)

    // Maybe = forall k. Just k | Nothing
    const MaybeType = forall(
      [[kTVar, unitKind]],
      sumType({
        Just: kType,
        Nothing: unitType
      }))

    // fmap = forall a b. (a -> b) -> f a -> f b
    const fmapType = forall(
      [[aTVar, unitKind],
       [bTVar, unitKind]],
      arrow(
        arrow(aType, bType),
        applicationType(fType, aType),
        applicationType(fType, bType)))

    // Functor = forall f. { fmap }
    const FunctorClass = forall(
      [[fTVar, unitArrow]],
      recordType({
        fmap: fmapType
      }))

    const xVar = termVar('x')
    const mapVar = termVar('map')
    const maybeAVar = termVar('maybeA')

    const MaybeAType = applicationType(MaybeType, aType)
    const MaybeBType = applicationType(MaybeType, bType)
    const ABArrowType = arrow(aType, bType)

    // maybeFmap =
    //   Lambda a b .
    //     lambda map maybeA .
    //       match maybeA
    //         Just x -> MaybeB.Just map x
    //         Nothing -> MaybeB.Nothing
    const maybeFmap = typeLambda(
      [[aTVar, unitKind],
       [bTVar, unitKind]],
      lambda(
        [[mapVar, ABArrowType],
         [maybeAVar, MaybeAType]],
        match(
          varTerm(maybeAVar, MaybeAType),
          MaybeBType,
          {
            Just: lambda(
              [[xVar, aType]],
              variant(
                MaybeBType,
                'Just',
                apply(
                  varTerm(mapVar, ABArrowType),
                  varTerm(xVar, aType)))),

            Nothing: lambda(
              [[xVar, unitType]],
              variant(
                MaybeBType,
                'Nothing',
                unitTerm))
          })))

    const MaybeFunctorClass = applicationType(
      FunctorClass, MaybeType)

    const MaybeFunctorInstance = record({
      fmap: maybeFmap
    })

    assert::termTypeEquals(MaybeFunctorInstance, MaybeFunctorClass)

    const showType = arrow(sType, StringType)

    const ShowClass = forall(
      [[sTVar, unitKind]],
      recordType({
        show: showType
      }))

    const showAVar = termVar('showA')
    const showAType = applicationType(ShowClass, aType)

    const StringShowClass = applicationType(
      ShowClass, StringType)

    const StringShowInstance = record({
      show: lambda(
        [[xVar, StringType]],
        body(
          [varTerm(xVar, StringType)],
          StringType,
          str => `str(${str})`))
    })

    assert::termTypeEquals(StringShowInstance, StringShowClass)

    const NumberShowClass = applicationType(
      ShowClass, NumberType)

    const NumberShowInstance = record({
      show: lambda(
        [[xVar, NumberType]],
        body(
          [varTerm(xVar, NumberType)],
          StringType,
          num => `num(${num})`))
    })

    assert::termTypeEquals(NumberShowInstance, NumberShowClass)

    const MaybeNum = applicationType(
      MaybeType, NumberType)

    const CompiledMaybeNum = MaybeNum.compileType()

    assert.test('maybe show 1', assert => {
      const maVar = termVar('ma')
      const xStrVar = termVar('xStr')

      // MaybeShowInstance =
      //   Λ a :: * .
      //     λ showA : Show a .
      //       show : Maybe a -> String
      //       show ma = match ma
      //         Just x: `Just ${ showA.show x }`
      //         Nothing: 'Nothing'
      const MaybeShowInstance = typeLambda(
        [[aTVar, unitKind]],
        lambda(
          [[showAVar, showAType]],
          record({
            show: lambda(
              [[maVar, MaybeAType]],
              match(
                varTerm(maVar, MaybeAType),
                StringType,
                {
                  Just: lambda(
                    [[xVar, aType]],
                    lets(
                      [[xStrVar,
                        apply(
                          projectRecord(
                            varTerm(
                              showAVar, showAType),
                            'show'),
                          varTerm(xVar, aType))
                      ]],

                      body(
                        [varTerm(xStrVar, StringType)],
                        StringType,
                        xStr =>
                          `Just(${xStr})`
                      ))),

                  Nothing: lambda(
                    [[xVar, unitType]],
                    value('Nothing', StringType))
                })),
          })))

      const MaybeStringShowInstance = apply(
        applyType(
          MaybeShowInstance, StringType),
        StringShowInstance)

      const showMaybeStr = compileTerm(MaybeStringShowInstance).get('show')

      const MaybeString = applicationType(
        MaybeType, StringType)

      const CompiledMaybeStr = MaybeString.compileType()

      const justFoo = CompiledMaybeStr.construct('Just', 'foo')
      assert.equals(showMaybeStr.call(justFoo), 'Just(str(foo))')

      const nothingStr = CompiledMaybeStr.construct('Nothing', unit)
      assert.equals(showMaybeStr.call(nothingStr), 'Nothing')

      const MaybeNumShowInstance = apply(
        applyType(
          MaybeShowInstance, NumberType),
        NumberShowInstance)

      const showMaybeNum = compileTerm(MaybeNumShowInstance).get('show')

      const justOne = CompiledMaybeNum.construct('Just', 1)
      assert.equals(showMaybeNum.call(justOne), 'Just(num(1))')

      const nothingNum = CompiledMaybeNum.construct('Nothing', unit)
      assert.equals(showMaybeNum.call(nothingNum), 'Nothing')

      assert.throws(() => showMaybeNum.call(nothingStr))

      assert.end()
    })

    assert.test('Maybe show 2', assert => {
      const functorFVar = termVar('functorF')
      const functorFType = applicationType(FunctorClass, fType)

      // fmapShow =
      //   Λ f :: * -> * .
      //   Λ a :: * .
      //     λ showA : Show a .
      //     λ functorF : Functor f .
      //       functorF.fmap [a, String] showA.show

      const fmapShow = typeLambda(
        [[fTVar, unitArrow],
         [aTVar, unitKind]],
        termLambda(
          [[showAVar, showAType],
           [functorFVar, functorFType]],
          apply(
            applyType(
              projectRecord(
                varTerm(functorFVar, functorFType),
                'fmap'),
              aType,
              StringType),
            projectRecord(
              varTerm(showAVar, showAType),
              'show'))))

      const fmapShowMaybeNumTerm = apply(
        applyType(
          fmapShow,
          MaybeType,
          NumberType),
        NumberShowInstance,
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

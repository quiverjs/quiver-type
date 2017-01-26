import test from 'tape'

import {
  varGen,
  lets, body, unit, unitTerm,
  value, match, record, variant,
  lambda, typeLambda, termLambda,
  projectRecord, apply, applyType,
  sumType, unitType, arrow, forall,
  recordType, typeApp,
  unitKind, arrowKind,
  compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

import { termTypeEquals } from './util'

test('type class test', assert => {
  assert.test('basic functor', assert => {
    const { termVar, typeVar, varTerm, varType } = varGen()

    const unitArrow = arrowKind(unitKind, unitKind)

    const aType = varType('a', unitKind)
    const bType = varType('b', unitKind)
    const kType = varType('k', unitKind)
    const sType = varType('s', unitKind)
    const fType = varType('f', unitArrow)

    // Maybe = forall k. Just k | Nothing
    const MaybeType = forall(
      [[typeVar('k'), unitKind]],
      sumType({
        Just: kType,
        Nothing: unitType
      }))

    // fmap = forall a b. (a -> b) -> f a -> f b
    const fmapType = forall(
      [[typeVar('a'), unitKind],
       [typeVar('b'), unitKind]],
      arrow(
        arrow(aType, bType),
        typeApp(fType, aType),
        typeApp(fType, bType)))

    // Functor = forall f. { fmap }
    const FunctorClass = forall(
      [[typeVar('f'), unitArrow]],
      recordType({
        fmap: fmapType
      }))

    const MaybeAType = typeApp(MaybeType, aType)
    const MaybeBType = typeApp(MaybeType, bType)
    const ABArrowType = arrow(aType, bType)

    // maybeFmap =
    //   Lambda a b .
    //     lambda map maybeA .
    //       match maybeA
    //         Just x -> MaybeB.Just map x
    //         Nothing -> MaybeB.Nothing
    const maybeFmap = typeLambda(
      [[typeVar('a'), unitKind],
       [typeVar('b'), unitKind]],
      lambda(
        [[termVar('map'), ABArrowType],
         [termVar('maybeA'), MaybeAType]],
        match(
          varTerm('maybeA', MaybeAType),
          MaybeBType,
          {
            Just: lambda(
              [[termVar('x'), aType]],
              variant(
                MaybeBType,
                'Just',
                apply(
                  varTerm('map', ABArrowType),
                  varTerm('x', aType)))),

            Nothing: lambda(
              [[termVar('_'), unitType]],
              variant(
                MaybeBType,
                'Nothing',
                unitTerm))
          })))

    const MaybeFunctorClass = typeApp(
      FunctorClass, MaybeType)

    const MaybeFunctorInstance = record({
      fmap: maybeFmap
    })

    assert::termTypeEquals(MaybeFunctorInstance, MaybeFunctorClass)

    const ShowClass = forall(
      [[typeVar('s'), unitKind]],
      recordType({
        show: arrow(sType, StringType)
      }))

    const showAType = typeApp(ShowClass, aType)

    const StringShowClass = typeApp(
      ShowClass, StringType)

    const StringShowInstance = record({
      show: lambda(
        [[termVar('x'), StringType]],
        body(
          [varTerm('x', StringType)],
          StringType,
          str => `str(${str})`))
    })

    assert::termTypeEquals(StringShowInstance, StringShowClass)

    const NumberShowClass = typeApp(
      ShowClass, NumberType)

    const NumberShowInstance = record({
      show: lambda(
        [[termVar('x'), NumberType]],
        body(
          [varTerm('x', NumberType)],
          StringType,
          num => `num(${num})`))
    })

    assert::termTypeEquals(NumberShowInstance, NumberShowClass)

    const MaybeNum = typeApp(
      MaybeType, NumberType)

    const CompiledMaybeNum = MaybeNum.compileType()

    assert.test('maybe show 1', assert => {
      // MaybeShowInstance =
      //   Λ a :: * .
      //     λ showA : Show a .
      //       show : Maybe a -> String
      //       show ma = match ma
      //         Just x: `Just ${ showA.show x }`
      //         Nothing: 'Nothing'
      const MaybeShowInstance = typeLambda(
        [[typeVar('a'), unitKind]],
        lambda(
          [[termVar('showA'), showAType]],
          record({
            show: lambda(
              [[termVar('ma'), MaybeAType]],
              match(
                varTerm('ma', MaybeAType),
                StringType,
                {
                  Just: lambda(
                    [[termVar('x'), aType]],
                    lets(
                      [[termVar('xStr'),
                        apply(
                          projectRecord(
                            varTerm(
                              'showA', showAType),
                            'show'),
                          varTerm('x', aType))
                      ]],

                      body(
                        [varTerm('xStr', StringType)],
                        StringType,
                        xStr =>
                          `Just(${xStr})`
                      ))),

                  Nothing: lambda(
                    [[termVar('_'), unitType]],
                    value('Nothing', StringType))
                })),
          })))

      const MaybeStringShowInstance = apply(
        applyType(
          MaybeShowInstance, StringType),
        StringShowInstance)

      const showMaybeStr = compile(MaybeStringShowInstance).get('show')

      const MaybeString = typeApp(
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

      const showMaybeNum = compile(MaybeNumShowInstance).get('show')

      const justOne = CompiledMaybeNum.construct('Just', 1)
      assert.equals(showMaybeNum.call(justOne), 'Just(num(1))')

      const nothingNum = CompiledMaybeNum.construct('Nothing', unit)
      assert.equals(showMaybeNum.call(nothingNum), 'Nothing')

      assert.throws(() => showMaybeNum.call(nothingStr))

      assert.end()
    })

    assert.test('Maybe show 2', assert => {
      const functorFType = typeApp(FunctorClass, fType)

      // fmapShow =
      //   Λ f :: * -> * .
      //   Λ a :: * .
      //     λ showA : Show a .
      //     λ functorF : Functor f .
      //       functorF.fmap [a, String] showA.show

      const fmapShow = typeLambda(
        [[typeVar('f'), unitArrow],
         [typeVar('a'), unitKind]],
        termLambda(
          [[termVar('showA'), showAType],
           [termVar('functorF'), functorFType]],
          apply(
            applyType(
              projectRecord(
                varTerm('functorF', functorFType),
                'fmap'),
              aType,
              StringType),
            projectRecord(
              varTerm('showA', showAType),
              'show'))))

      const fmapShowMaybeNumTerm = apply(
        applyType(
          fmapShow,
          MaybeType,
          NumberType),
        NumberShowInstance,
        MaybeFunctorInstance)

      const fmapShowMaybeNum = compile(fmapShowMaybeNumTerm)

      const justOne = CompiledMaybeNum.construct('Just', 1)

      const justOneStr = fmapShowMaybeNum.call(justOne)

      assert.equals(justOneStr.tag, 'Just')
      assert.equals(justOneStr.value, 'num(1)')

      assert.end()
    })

    assert.end()
  })
})

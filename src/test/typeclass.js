import test from 'tape'

import {
  lets, body, value,
  unit, unitTerm,
  varTerm, varType,
  match, when, variant,
  lambda, typeLambda,
  apply, applyType,
  sumType, unitType,
  arrow, forall, typeApp,
  unitKind, arrowKind,
  typeclass, classInstance,
  classMethod, deconstraint,
  constraintLambda,
  compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

import { termTypeEquals } from './util'

test('type class test', assert => {
  assert.test('basic functor', assert => {
    const unitArrow = arrowKind(unitKind, unitKind)

    const aType = varType('a', unitKind)
    const bType = varType('b', unitKind)
    const kType = varType('k', unitKind)
    const sType = varType('s', unitKind)
    const fType = varType('f', unitArrow)

    // Maybe = forall k. Just k | Nothing
    const MaybeType = forall(
      [['k', unitKind]],
      sumType({
        Just: kType,
        Nothing: unitType
      }))

    // fmap = forall a b. (a -> b) -> f a -> f b
    const fmapType = forall(
      [['a', unitKind],
       ['b', unitKind]],
      arrow(
        arrow(aType, bType),
        typeApp(fType, aType),
        typeApp(fType, bType)))

    // Functor = forall f. { fmap }
    const FunctorClass = forall(
      [['f', unitArrow]],
      typeclass('Functor', {
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
      [['a', unitKind],
       ['b', unitKind]],
      lambda(
        [['map', ABArrowType],
         ['maybeA', MaybeAType]],
        match(
          varTerm('maybeA', MaybeAType),
          MaybeBType,

          when(MaybeAType, 'Just', 'x',
            variant(
              MaybeBType,
              'Just',
              apply(
                varTerm('map', ABArrowType),
                varTerm('x', aType)))),

          when(MaybeAType, 'Nothing', '_',
            variant(
              MaybeBType,
              'Nothing',
              unitTerm)))))

    const MaybeFunctorClass = typeApp(
      FunctorClass, MaybeType)

    const MaybeFunctorInstance = classInstance(
      MaybeFunctorClass,
      {
        fmap: maybeFmap
      })

    assert::termTypeEquals(MaybeFunctorInstance, MaybeFunctorClass)

    const ShowClass = forall(
      [['s', unitKind]],
      typeclass('Show', {
        show: arrow(sType, StringType)
      }))

    const StringShowClass = typeApp(
      ShowClass, StringType)

    const StringShowInstance = classInstance(
      StringShowClass,
      {
        show: lambda(
          [['x', StringType]],
          body(
            [varTerm('x', StringType)],
            StringType,
            str => `str(${str})`))
      })

    assert::termTypeEquals(StringShowInstance, StringShowClass)

    const NumberShowClass = typeApp(
      ShowClass, NumberType)

    const NumberShowInstance = classInstance(
      NumberShowClass,
      {
        show: lambda(
          [['x', NumberType]],
          body(
            [varTerm('x', NumberType)],
            StringType,
            num => `num(${num})`))
      })

    assert::termTypeEquals(NumberShowInstance, NumberShowClass)

    const MaybeNum = typeApp(MaybeType, NumberType)

    const CompiledMaybeNum = MaybeNum.compileType()

    const ShowAClass = typeApp(ShowClass, aType)
    const ShowMaybeAClass = typeApp(ShowClass, MaybeAType)

    assert.test('maybe show 1', assert => {
      const maTerm = varTerm('ma', MaybeAType)

      // MaybeShowInstance =
      //   Λ a :: * .
      //     Show a =>
      //       instance Show Maybe a where
      //         show : Maybe a -> String
      //         show ma = match ma
      //           Just x: `Just ${ showA.show x }`
      //           Nothing: 'Nothing'
      const MaybeShowInstance = typeLambda(
        [['a', unitKind]],
        constraintLambda(
          [ShowAClass],
          classInstance(
            ShowMaybeAClass,
            {
              show: lambda(
                [['ma', MaybeAType]],
                match(
                  maTerm,
                  StringType,

                  when(MaybeAType, 'Just', 'x',
                    lets(
                      [['x-str',
                        apply(
                          classMethod(ShowAClass, 'show'),
                          varTerm('x', aType))
                      ]],

                      body(
                        [varTerm('x-str', StringType)],
                        StringType,
                        xStr =>
                          `Just(${xStr})`
                      ))),

                  when(MaybeAType, 'Nothing', '_',
                    value('Nothing', StringType)))),
            })))

      const MaybeStringShowInstance = apply(
        applyType(MaybeShowInstance, StringType),
        StringShowInstance)

      const showMaybeStr = compile(deconstraint(MaybeStringShowInstance))
        .get('show')

      const MaybeString = typeApp(MaybeType, StringType)

      const CompiledMaybeStr = MaybeString.compileType()

      const justFoo = CompiledMaybeStr.construct('Just', 'foo')
      assert.equals(showMaybeStr.call(justFoo), 'Just(str(foo))')

      const nothingStr = CompiledMaybeStr.construct('Nothing', unit)
      assert.equals(showMaybeStr.call(nothingStr), 'Nothing')

      const MaybeNumShowInstance = apply(
        applyType(MaybeShowInstance, NumberType),
        NumberShowInstance)

      const showMaybeNum = compile(deconstraint(MaybeNumShowInstance))
        .get('show')

      const justOne = CompiledMaybeNum.construct('Just', 1)
      assert.equals(showMaybeNum.call(justOne), 'Just(num(1))')

      const nothingNum = CompiledMaybeNum.construct('Nothing', unit)
      assert.equals(showMaybeNum.call(nothingNum), 'Nothing')

      assert.throws(() => showMaybeNum.call(nothingStr))

      assert.end()
    })

    assert.test('Maybe show 2', assert => {
      const FunctorFClass = typeApp(FunctorClass, fType)

      // fmapShow =
      //   Λ f :: * -> * .
      //   Λ a :: * .
      //     λ showA : Show a .
      //     λ functorF : Functor f .
      //       functorF.fmap [a, String] showA.show

      const fmapShow = typeLambda(
        [['f', unitArrow],
         ['a', unitKind]],
        constraintLambda(
          [ShowAClass, FunctorFClass],
          apply(
            applyType(
              classMethod(FunctorFClass, 'fmap'),
              aType, StringType),
            classMethod(ShowAClass, 'show'))))

      const fmapShowMaybeNumTerm = apply(
        applyType(fmapShow, MaybeType, NumberType),
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

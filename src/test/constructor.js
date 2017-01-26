import test from 'tape'

import { IList } from '../lib/core'

import { TypeConstructor } from '../lib/type'

import {
  varGen, body, compiledBody,
  value, lambda, typeLambda,
  apply, applyType,
  arrow, forall,
  typeConstructor,
  typeApp,
  unitKind, arrowKind,
  compile, typedFunction
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

import {
  termTypeEquals, typeKindEquals
} from './util'

test('type constructor test', assert => {
  assert.test('list constructor', assert => {
    const { termVar, typeVar, varTerm, varType } = varGen()

    const aType = varType('a', unitKind)

    const listTypeCheckerBuilder = compiledTypes => {
      assert.equals(compiledTypes.size, 1)

      const elementCompiledType = compiledTypes.get(0)

      return list => {
        if(!IList.isList(list)) {
          return new TypeError('argument must be ImmutableList')
        }

        for(const element of list) {
          const err = elementCompiledType.typeCheck(element)
          if(err) return err
        }
      }
    }

    const IListConstructor = typeConstructor(
      [aType], listTypeCheckerBuilder)

    assert::typeKindEquals(IListConstructor, unitKind)

    const IListType = forall(
      [[typeVar('a'), unitKind]],
      IListConstructor)

    assert::typeKindEquals(IListType, arrowKind(unitKind, unitKind))

    assert.throws(() => IListConstructor.compileType())
    assert.throws(() => IListType.compileType())

    const NumberListType = typeApp(IListType, NumberType)
    const StringListType = typeApp(IListType, StringType)

    assert.ok(NumberListType instanceof TypeConstructor,
      'ApplicationType should return applied type if both types are terminal')

    const compiledNumListType = NumberListType.compileType()

    const numberList = IList([1, 2, 3])
    const stringList = IList(['foo', 'bar'])
    const mixedList = IList([1, 'foo', 2, {}])

    assert.notOk(compiledNumListType.typeCheck(numberList))
    assert.ok(compiledNumListType.typeCheck(stringList))
    assert.ok(compiledNumListType.typeCheck(mixedList))

    const bType = varType('b', unitKind)
    const cType = varType('c', unitKind)

    const fType = arrow(bType, cType)

    const bListType = typeApp(IListType, bType)
    const cListType = typeApp(IListType, cType)

    const fmapBody = compiledBody(
      [
        varTerm('f', fType),
        varTerm('l', bListType)
      ],
      cListType,
      (mapperCType, bListCType) =>
        (mapper, list) =>
          list.map(element =>
            mapperCType.call(mapper, [element])))

    // fmap :: forall b :: *, c :: * .
    //          (b -> c) -> IList b -> IList c
    const fmapTerm = typeLambda(
      [[typeVar('b'), unitKind],
       [typeVar('c'), unitKind]],
      lambda(
          [[termVar('f'), fType],
           [termVar('l'), bListType]],
          fmapBody))

    const fmapNumStr = applyType(
      fmapTerm, NumberType, StringType)

    const numToString = lambda(
      [[termVar('x'), NumberType]],
      body(
        [ varTerm('x', NumberType) ],
        StringType,
        num => `${num}`))

    const numToStrListTerm = apply(
      fmapNumStr, numToString)

    const numToStrListFn = compile(numToStrListTerm)

    assert.deepEquals(
      numToStrListFn.call(IList([1, 2, 3])).toArray(),
      ['1', '2', '3'])

    assert.throws(() => numToStrListFn.call(IList([1, 'foo'])))
    assert.throws(() => numToStrListFn.call([1, 2, 3]))
    assert.throws(() => numToStrListFn.call(1))

    const strListTerm = apply(
      numToStrListTerm,
      value(
        IList([1, 2, 3]),
        NumberListType))

    assert::termTypeEquals(strListTerm, StringListType)
    assert.deepEquals(compile(strListTerm).toArray(),
      ['1', '2', '3'])

    const fmapNumStrFn = compile(fmapNumStr)

    const squareStrFn = typedFunction(
      [NumberType],
      StringType,
      num => `${num*num}`)

    assert.deepEquals(
      fmapNumStrFn.call(squareStrFn, IList([1, 2, 3])).toArray(),
      ['1', '4', '9'])

    assert.end()
  })
})

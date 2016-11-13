import test from 'tape'

import {
  BodyTerm,
  ValueTerm,
  VariableTerm,
  TermLambdaTerm,
  TypeLambdaTerm,
  TypeApplicationTerm,
  TermApplicationTerm
} from '../lib/term'

import {
  ArrowType,
  ForAllType,
  VariableType,
  TypeConstructor,
  ApplicationType
} from '../lib/type'

import {
  unitKind, ArrowKind
} from '../lib/kind'

import {
  List, TypeVariable, TermVariable
} from '../lib/core'

import {
  wrapFunction, compileTerm
} from '../lib/util'

import {
  NumberType, StringType,
  termTypeEquals, typeKindEquals
} from './util'

test('type constructor test', assert => {
  assert.test('list constructor', assert => {
    const aTVar = new TypeVariable('a')

    const aType = new VariableType(aTVar, unitKind)

    const listTypeCheckerBuilder = compiledTypes => {
      assert.equals(compiledTypes.size, 1)
      const elementCompiledType = compiledTypes.get(0)

      return list => {
        if(!List.isList(list)) {
          return new TypeError('argument must be ImmutableList')
        }

        for(const element of list) {
          const err = elementCompiledType.typeCheck(element)
          if(err) return err
        }
      }
    }

    const ListConstructor = new TypeConstructor(
      List([aType]), listTypeCheckerBuilder)

    assert::typeKindEquals(ListConstructor, unitKind)

    const ListType = new ForAllType(
      aTVar, unitKind, ListConstructor)

    assert::typeKindEquals(ListType, new ArrowKind(unitKind, unitKind))

    assert.throws(() => ListConstructor.compileType())
    assert.throws(() => ListType.compileType())

    const NumberListType = new ApplicationType(ListType, NumberType)
    const StringListType = new ApplicationType(ListType, StringType)

    assert.ok(NumberListType instanceof TypeConstructor,
      'ApplicationType should return applied type if both types are terminal')

    const compiledNumListType = NumberListType.compileType()

    const numberList = List([1, 2, 3])
    const stringList = List(['foo', 'bar'])
    const mixedList = List([1, 'foo', 2, {}])

    assert.notOk(compiledNumListType.typeCheck(numberList))
    assert.ok(compiledNumListType.typeCheck(stringList))
    assert.ok(compiledNumListType.typeCheck(mixedList))

    const bTVar = new TypeVariable('b')
    const cTVar = new TypeVariable('c')

    const bType = new VariableType(bTVar, unitKind)
    const cType = new VariableType(cTVar, unitKind)

    const fVar = new TermVariable('f')
    const fType = new ArrowType(bType, cType)

    const lVar = new TermVariable('l')
    const bListType = new ApplicationType(ListType, bType)

    const cListType = new ApplicationType(ListType, cType)

    const fmapBody = new BodyTerm(
      List([
        new VariableTerm(fVar, fType),
        new VariableTerm(lVar, bListType)
      ]),
      cListType,
      (mapperCType, bListCType) =>
        (mapper, list) =>
          list.map(element =>
            mapperCType.call(mapper, element))
    )

    // fmap :: forall b :: *, c :: * .
    //          (b -> c) -> List b -> List c
    const fmapTerm = new TypeLambdaTerm(
      bTVar, unitKind,
      new TypeLambdaTerm(
        cTVar, unitKind,
        new TermLambdaTerm(
          fVar, fType,
          new TermLambdaTerm(
            lVar, bListType,
            fmapBody
          ))))

    const fmapNumStr = new TypeApplicationTerm(
      new TypeApplicationTerm(
        fmapTerm, NumberType),
      StringType)
      .evaluate()

    const xVar = new TermVariable('x')

    const numToString = new TermLambdaTerm(
      xVar, NumberType,
      new BodyTerm(
        List([ new VariableTerm(xVar, NumberType) ]),
        StringType,
        NumberCType =>
          num => `${num}`))

    const numToStrListTerm = new TermApplicationTerm(
      fmapNumStr, numToString)
      .evaluate()

    const numToStrListFn = compileTerm(numToStrListTerm)

    assert.deepEquals(
      numToStrListFn.call(List([1, 2, 3])).toArray(),
      ['1', '2', '3'])

    assert.throws(() => numToStrListFn.call(List([1, 'foo'])))
    assert.throws(() => numToStrListFn.call([1, 2, 3]))
    assert.throws(() => numToStrListFn.call(1))

    const strListTerm = new TermApplicationTerm(
      numToStrListTerm,
      new ValueTerm(
        List([1, 2, 3]),
        NumberListType))

    assert::termTypeEquals(strListTerm, StringListType)
    assert.deepEquals(compileTerm(strListTerm).toArray(),
      ['1', '2', '3'])

    const fmapNumStrFn = compileTerm(fmapNumStr)

    const squareStrFn = wrapFunction(
      num => `${num*num}`,
      List([NumberType]), StringType)

    assert.deepEquals(
      fmapNumStrFn.call(squareStrFn, List([1, 2, 3])).toArray(),
      ['1', '4', '9'])

    assert.end()
  })
})

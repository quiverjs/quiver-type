import test from 'tape'

import { ISet } from '../lib/core'

import {
  varGen, body, rawBody,
  value, lambda, apply, arrow,
  typedFunction, compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

import {
  equals, termTypeEquals
} from './util'

test('term lambda test', assert => {
  assert.test('identity test', assert => {
    const { termVar, varTerm } = varGen()

    const idNumTerm = rawBody(
      [varTerm('x', NumberType)],
      NumberType,
      x => x)

    // idNum :: Number -> Number
    // idNum = \x :: Number -> x
    const idNumLambda = lambda(
      [[termVar('x'), NumberType]],
      idNumTerm)

    assert::equals(idNumLambda.freeTermVariables(), ISet())

    assert.equal(
      idNumLambda.bindTerm(termVar('x'), value(1, NumberType)),
      idNumLambda,
      'should not affect binding inside lambda')

    const argTerm = value(3, NumberType)

    const appliedTerm = apply(idNumLambda, argTerm)

    // should not affect binding inside lambda
    assert.equal(
      appliedTerm.bindTerm(
        termVar('x'),
        value(5, NumberType)),
      appliedTerm,
      'should not affect binding inside lambda')

    assert::equals(appliedTerm.freeTermVariables(), ISet())

    const result = compile(appliedTerm)
    assert.equal(result, 3)

    const stringArg = value('foo', StringType)

    assert.throws(() => {
      apply(idNumLambda, stringArg)
    }, 'type check should reject accept string argument')

    assert.throws(() => {
      apply(idNumLambda, idNumLambda)
    }, 'type check should reject accept lambda argument')

    assert.end()
  })

  assert.test('ignored variable lambda', assert => {
    const { termVar } = varGen()

    const constantTerm = value('foo', StringType)

    const constantLambda = lambda(
      [[termVar('x'), NumberType]],
      constantTerm)

    const argTerm = value(8, NumberType)

    const appliedTerm = apply(constantLambda, argTerm)

    const result = compile(appliedTerm)
    assert.equal(result, 'foo')

    assert.end()
  })

  assert.test('two variables lambda', assert => {
    const { termVar, varTerm } = varGen()

    const plusTerm = rawBody(
      [
        varTerm('x', NumberType),
        varTerm('y', NumberType)
      ],
      NumberType,
      (xTerm, yTerm) => {
        const result = xTerm.value + yTerm.value
        return value(result, NumberType)
      })

    const yPlusLambda = lambda(
      [[termVar('y'), NumberType]],
      plusTerm)

    assert::equals(yPlusLambda.freeTermVariables(), ISet([termVar('x')]))

    const plusLambda = lambda(
      [[termVar('x'), NumberType]],
      yPlusLambda)

    assert::equals(plusLambda.freeTermVariables(), ISet())

    const plusType = arrow(NumberType, NumberType, NumberType)
    assert::termTypeEquals(plusLambda, plusType)

    const arg1 = value(2, NumberType)
    const plusTwoLambda = apply(plusLambda, arg1)

    const plusTwoType = arrow(NumberType, NumberType)
    assert::termTypeEquals(plusTwoLambda, plusTwoType)

    const arg2 = value(3, NumberType)
    const result1 = apply(plusTwoLambda, arg2)

    assert.equal(compile(result1), 5)

    const arg3 = value(4, NumberType)
    const result2 = apply(plusTwoLambda, arg3)

    assert.equal(compile(result2), 6)

    assert.end()
  })

  assert.test('lambda compilation', assert => {
    const { termVar, varTerm } = varGen()

    const xLambda = lambda(
      [[termVar('x'), NumberType]],
      varTerm('x', NumberType))

    const func1 = compile(xLambda)
    assert.equals(func1.call(2), 2)

    const yxLambda = lambda(
      [[termVar('y'), NumberType]],
      xLambda)

    const func2 = compile(yxLambda)

    assert.throws(() => func2.call('foo', 'bar'),
      'should type check arguments before calling compiled function')

    assert.throws(() => func2.call(1),
      'should check argument size')

    assert.throws(() => func2.call(1, 2, 3),
      'should check argument size')

    assert.equals(func2.call(3, 4), 4)

    const yLambda = lambda(
      [[termVar('y'), NumberType]],
      varTerm('x', NumberType))

    assert.throws(() => compile(yLambda),
      'should not able to compile term with free variable')

    const xyLambda = lambda(
      [[termVar('x'), NumberType]],
      yLambda)

    const func3 = compile(xyLambda)
    assert.equals(func3.call(1, 2), 1)

    const xyxLambda = lambda(
      [[termVar('x'), NumberType]],
      yxLambda)

    const func4 = compile(xyxLambda)

    assert.equals(func4.call(2, 3, 4), 4)

    assert.end()
  })

  assert.test('higher order function', assert => {
    const { termVar, varTerm } = varGen()

    const fType = arrow(NumberType, NumberType)

    const applyLambda = lambda(
      [[termVar('f'), fType],
       [termVar('x'), NumberType]],
      apply(
        varTerm('f', fType),
        varTerm('x', NumberType)))

    const plusTwoLambda = lambda(
      [[termVar('y'), NumberType]],
      body(
        [varTerm('y', NumberType)],
        NumberType,
        y => y + 2
      ))

    const applyFunc = compile(applyLambda)
    const plusTwoFunc = compile(plusTwoLambda)

    assert.equals(plusTwoFunc.call(3), 5)
    assert.equals(applyFunc.call(plusTwoFunc, 3), 5)

    assert.throws(() => applyFunc.call(x => x+2, 3),
      'should not accept raw function')

    const wrappedFunc = typedFunction(
      [NumberType],
      NumberType,
      x => x + 3)

    assert.equals(wrappedFunc.call(2), 5)
    assert.equals(applyFunc.call(wrappedFunc, 2), 5)

    assert.throws(() => applyFunc.call(plusTwoFunc))
    assert.throws(() => applyFunc.call(plusTwoFunc, 'foo'))

    const numStrFunc = typedFunction(
      [NumberType],
      StringType,
      x => `${x}`)

    assert.equals(numStrFunc.call(1), '1')
    assert.throws(() => applyFunc.call(numStrFunc, 1),
      'should type check function argument of its type')

    assert.end()
  })
})

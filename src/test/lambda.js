import test from 'tape'

import {
  TermVariable, ISet, IList
} from '../lib/core'

import {
  BodyTerm,
  ValueTerm,
  RawBodyTerm,
  VariableTerm,
  ValueLambdaTerm,
  TermApplicationTerm
} from '../lib/term'

import { ArrowType } from '../lib/type'
import { wrapFunction, compileTerm } from '../lib/util'

import { NumberType, StringType } from '../lib/builtin'

import {
  equals, termTypeEquals
} from './util'

test('term lambda test', assert => {
  assert.test('identity test', assert => {
    const xVar = new TermVariable('x')

    const idNumTerm = new RawBodyTerm(
      IList([new VariableTerm(xVar, NumberType)]),
      NumberType,
      x => x)

    // idNum :: Number -> Number
    // idNum = \x :: Number -> x
    const idNumLambda = new ValueLambdaTerm(
      xVar, NumberType, idNumTerm)

    assert::equals(idNumLambda.freeTermVariables(), ISet())

    assert.equal(
      idNumLambda.bindTerm(xVar, new ValueTerm(1, NumberType)),
      idNumLambda,
      'should not affect binding inside lambda')

    const argTerm = new ValueTerm(3, NumberType)

    const appliedTerm = new TermApplicationTerm(
      idNumLambda, argTerm)

    // should not affect binding inside lambda
    assert.equal(
      appliedTerm.bindTerm(xVar, new ValueTerm(5, NumberType)),
      appliedTerm,
      'should not affect binding inside lambda')

    assert::equals(appliedTerm.freeTermVariables(), ISet())

    const result = compileTerm(appliedTerm)
    assert.equal(result, 3)

    const stringArg = new ValueTerm('foo', StringType)

    assert.throws(() => {
      new TermApplicationTerm(idNumLambda, stringArg)
    }, 'type check should reject accept string argument')

    assert.throws(() => {
      new TermApplicationTerm(idNumLambda, idNumLambda)
    }, 'type check should reject accept lambda argument')

    assert.end()
  })

  assert.test('ignored variable lambda', assert => {
    const xVar = new TermVariable('x')

    const constantTerm = new ValueTerm('foo', StringType)

    const constantLambda = new ValueLambdaTerm(
      xVar, NumberType, constantTerm)

    const argTerm = new ValueTerm(8, NumberType)

    const appliedTerm = new TermApplicationTerm(
      constantLambda, argTerm)

    const result = compileTerm(appliedTerm)
    assert.equal(result, 'foo')

    assert.end()
  })

  assert.test('two variables lambda', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const plusTerm = new RawBodyTerm(
      IList([
        new VariableTerm(xVar, NumberType),
        new VariableTerm(yVar, NumberType)
      ]),
      NumberType,
      (xTerm, yTerm) => {
        const result = xTerm.value + yTerm.value
        return new ValueTerm(result, NumberType)
      })

    const yPlusLambda = new ValueLambdaTerm(
      yVar, NumberType, plusTerm)

    assert::equals(yPlusLambda.freeTermVariables(), ISet([xVar]))

    const plusLambda = new ValueLambdaTerm(
      xVar, NumberType, yPlusLambda)

    assert::equals(plusLambda.freeTermVariables(), ISet())

    const plusType = new ArrowType(NumberType, new ArrowType(NumberType, NumberType))
    assert::termTypeEquals(plusLambda, plusType)

    const arg1 = new ValueTerm(2, NumberType)
    const plusTwoLambda = new TermApplicationTerm(
      plusLambda, arg1
    ).evaluate()

    const plusTwoType = new ArrowType(NumberType, NumberType)
    assert::termTypeEquals(plusTwoLambda, plusTwoType)

    const arg2 = new ValueTerm(3, NumberType)
    const result1 = new TermApplicationTerm(
      plusTwoLambda, arg2
    )

    assert.equal(compileTerm(result1), 5)

    const arg3 = new ValueTerm(4, NumberType)
    const result2 = new TermApplicationTerm(
      plusTwoLambda, arg3
    ).evaluate()

    assert.equal(compileTerm(result2), 6)

    assert.end()
  })

  assert.test('lambda compilation', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const varTerm = new VariableTerm(xVar, NumberType)

    const xLambda = new ValueLambdaTerm(
      xVar, NumberType, varTerm)

    const func1 = compileTerm(xLambda)
    assert.equals(func1.call(2), 2)

    const yxLambda = new ValueLambdaTerm(
      yVar, NumberType, xLambda)

    assert.throws(() => yxLambda.call('foo', 'bar'),
      'should type check arguments before calling compiled function')

    assert.throws(() => yxLambda.call(1),
      'should check argument size')

    assert.throws(() => yxLambda.call(1, 2, 3),
      'should check argument size')

    const func2 = compileTerm(yxLambda)
    assert.equals(func2.call(3, 4), 4)

    const yLambda = new ValueLambdaTerm(
      yVar, NumberType, varTerm)

    assert.throws(() => compileTerm(yLambda),
      'should not able to compile term with free variable')

    const xyLambda = new ValueLambdaTerm(
      xVar, NumberType, yLambda)

    const func3 = compileTerm(xyLambda)
    assert.equals(func3.call(1, 2), 1)

    const xyxLambda = new ValueLambdaTerm(
      xVar, NumberType, yxLambda)

    const func4 = compileTerm(xyxLambda)

    assert.equals(func4.call(2, 3, 4), 4)

    assert.end()
  })

  assert.test('higher order function', assert => {
    const fVar = new TermVariable('f')
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const fType = new ArrowType(NumberType, NumberType)

    const applyLambda = new ValueLambdaTerm(
      fVar, fType,
      new ValueLambdaTerm(
        xVar, NumberType,
        new TermApplicationTerm(
          new VariableTerm(fVar, fType),
          new VariableTerm(xVar, NumberType))))

    const plusTwoLambda = new ValueLambdaTerm(
      yVar, NumberType,
      new BodyTerm(
        IList([
          new VariableTerm(yVar, NumberType)
        ]),
        NumberType,
        yType =>
          y => y + 2
      ))

    const applyFunc = compileTerm(applyLambda)
    const plusTwoFunc = compileTerm(plusTwoLambda)

    assert.equals(plusTwoFunc.call(3), 5)
    assert.equals(applyFunc.call(plusTwoFunc, 3), 5)

    assert.throws(() => applyFunc.call(x => x+2, 3),
      'should not accept raw function')

    const wrappedFunc = wrapFunction(
      x => x + 3,
      IList([NumberType]),
      NumberType)

    assert.equals(wrappedFunc.call(2), 5)
    assert.equals(applyFunc.call(wrappedFunc, 2), 5)

    assert.throws(() => applyFunc.call(plusTwoFunc))
    assert.throws(() => applyFunc.call(plusTwoFunc, 'foo'))

    const numStrFunc = wrapFunction(
      x => `${x}`,
      IList([NumberType]),
      StringType
    )

    assert.equals(numStrFunc.call(1), '1')
    assert.throws(() => applyFunc.call(numStrFunc, 1),
      'should type check function argument of its type')

    assert.end()
  })
})

import test from 'tape'

import {
  TermVariable, TypeEnv, Set, List, emptyEnv
} from '../lib/core'

import {
  ValueExpression,
  VariableExpression,
  TypedVariableExpression,
  TermLambdaExpression,
  CompilableExpression,
  TermApplicationExpression
} from '../lib/expr'

import {
  LiteralType
} from '../lib/type'

import {
  equals, equalsType,
  NumberType, StringType
} from './util'

const compileExpr = function() {
  return this.compileBody(List())()
}

test('expression compilation test', assert => {
  assert.test('constant expression', assert => {
    const valueExpr = new ValueExpression(8, NumberType)
    const func = valueExpr.compileBody(List())
    assert.equals(typeof(func), 'function')

    assert.equals(func(), 8)
    assert.end()
  })

  assert.test('variable expression', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const varExpr = new VariableExpression(xVar)

    assert.throws(() => varExpr::compileExpr(List()))

    const xLambda = new TermLambdaExpression(
      xVar, NumberType, varExpr)

    const func1 = xLambda::compileExpr(List())
    assert.equals(func1.call(2), 2)

    const yxLambda = new TermLambdaExpression(
      yVar, NumberType, xLambda)

    assert.throws(() => yxLambda.call('foo', 'bar'),
      'should type check arguments before calling compiled function')

    const func2 = yxLambda::compileExpr(List())
    assert.equals(func2.call(3, 4), 4)

    const yLambda = new TermLambdaExpression(
      yVar, NumberType, varExpr)

    assert.throws(() => yLambda::compileExpr(List()))

    const xyLambda = new TermLambdaExpression(
      xVar, NumberType, yLambda)

    const func3 = xyLambda::compileExpr(List())
    assert.equals(func3.call(1, 2), 1)

    const xyxLambda = new TermLambdaExpression(
      xVar, NumberType, yxLambda)

    const func4 = xyxLambda::compileExpr(List())

    assert.equals(func4.call(2, 3, 4), 4)

    assert.end()
  })

  assert.test('compilable expression', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')

    const xVarExpr = new VariableExpression(xVar)
    const yVarExpr = new VariableExpression(yVar)

    const addExpr = new CompilableExpression(
      List([xVarExpr, yVarExpr]), NumberType,
      (xCompiledType, yCompiledType) => {
        assert.equals(xCompiledType.srcType, NumberType)
        assert.equals(yCompiledType.srcType, NumberType)

        return (x, y) => {
          return x+y
        }
      })

    const addLambda = new TermLambdaExpression(
      xVar, NumberType,
      new TermLambdaExpression(
        yVar, NumberType, addExpr))

    const compiledFunction = addLambda::compileExpr()

    assert.equals(compiledFunction.call(1, 2), 3)

    assert.throws(() => compiledFunction.call('foo', 'bar'))

    assert.end()
  })

  assert.test('term application test', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const zVar = new TermVariable('z')

    const addExpr = new CompilableExpression(
      List([
        new VariableExpression(xVar),
        new VariableExpression(yVar)
      ]),
      NumberType,
      (xCompiledType, yCompiledType) =>
        (x, y) => x+y)

    const addLambda = new TermLambdaExpression(
      xVar, NumberType,
      new TermLambdaExpression(
        yVar, NumberType, addExpr))

    const addFiveLambda = new TermLambdaExpression(
      zVar, NumberType,
      new TermApplicationExpression(
        new TermApplicationExpression(addLambda,
          new TypedVariableExpression(zVar, NumberType)),
        new ValueExpression(5, NumberType)))

    const compiledFunction = addFiveLambda::compileExpr()

    assert.equals(compiledFunction.call(2), 7)

    assert.end()
  })

  assert.test('partial application', assert => {
    const xVar = new TermVariable('x')
    const yVar = new TermVariable('y')
    const zVar = new TermVariable('z')

    const addExpr = new CompilableExpression(
      List([
        new VariableExpression(xVar),
        new VariableExpression(yVar)
      ]),
      NumberType,
      (xCompiledType, yCompiledType) =>
        (x, y) => x+y)

    const addLambda = new TermLambdaExpression(
      xVar, NumberType,
      new TermLambdaExpression(
        yVar, NumberType, addExpr))

    const adderLambda = new TermLambdaExpression(
      zVar, NumberType,
      new TermApplicationExpression(addLambda,
        new TypedVariableExpression(zVar, NumberType)))

    const compiledAdder = adderLambda::compileExpr()

    const fiveAdder = compiledAdder.func(5)
    
    assert.equals(fiveAdder.call(2), 7)
    assert.equals(fiveAdder.call(1), 6)
    assert.equals(fiveAdder.call(-2), 3)

    assert.throws(() => fiveAdder.call('foo'))

    assert.end()
  })
})

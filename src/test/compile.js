import test from 'tape'

import {
  TermVariable, TypeEnv, Set, List, emptyEnv
} from '../lib/core'

import {
  ValueExpression,
  VariableExpression,
  TermLambdaExpression,
  CompilableExpression
} from '../lib/expr'

import {
  LiteralType
} from '../lib/type'

import {
  equals, equalsType,
  NumberType, StringType
} from './util'

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

    assert.throws(() => varExpr.compileBody(List()))

    const xLambda = new TermLambdaExpression(
      xVar, NumberType, varExpr)

    const func1 = xLambda.compileBody(List())
    assert.equals(func1(2), 2)

    const yxLambda = new TermLambdaExpression(
      yVar, NumberType, xLambda)

    const func2 = yxLambda.compileBody(List())
    assert.equals(func2(3, 4), 4)

    const yLambda = new TermLambdaExpression(
      yVar, NumberType, varExpr)

    assert.throws(() => yLambda.compileBody(List()))

    const xyLambda = new TermLambdaExpression(
      xVar, NumberType, yLambda)

    const func3 = xyLambda.compileBody(List())
    assert.equals(func3(1, 2), 1)

    const xyxLambda = new TermLambdaExpression(
      xVar, NumberType, yxLambda)

    const func4 = xyxLambda.compileBody(List())

    assert.equals(func4(2, 3, 4), 4)

    assert.equals(func2('foo', 'bar'), 'bar',
      'compiled function do not type check implicitly')

    const compiledFunction = yxLambda.compileExpr()

    assert.equals(compiledFunction.call(1, 2), 2)
    assert.throws(() => compiledFunction.call('foo', 'bar'),
      'should type check arguments before calling compiled function')

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
          console.log('adding x+y:', x, y)
          return x+y
        }
      })

    const addLambda = new TermLambdaExpression(
      xVar, NumberType,
      new TermLambdaExpression(
        yVar, NumberType, addExpr))

    const compiledFunction = addLambda.compileExpr()

    assert.equals(compiledFunction.call(1, 2), 3)

    assert.throws(() => compiledFunction.call('foo', 'bar'))

    assert.end()
  })
})

import { List } from '../core/container'
import { TermVariable } from '../core/variable'
import { assertFunction, assertType, assertListContent } from '../core/assert'

import { BodyExpression } from '../expr/body'
import { TermLambdaExpression } from '../expr/term-lambda'
import { VariableExpression } from '../expr/variable'

import { Type } from '../type/type'

import { CompiledFunction } from '../compiled/function'

export const wrapFunction = (func, argTypes, returnType) => {
  assertFunction(func)
  assertType(returnType, Type)

  assertListContent(argTypes, Type)

  const argVars = argTypes.map(argType =>
    [new TermVariable('_'), argType])

  const argExprs = argVars.map(
    ([argVar, argType]) =>
      new VariableExpression(argVar, argType))

  const bodyExpr = new BodyExpression(
    argExprs, returnType,
    () => func)

  const lambdaExpr = argVars.reduceRight(
    (expr, [argVar, argType]) =>
      new TermLambdaExpression(argVar, argType, expr),
    bodyExpr)

  return new CompiledFunction(lambdaExpr, func)
}

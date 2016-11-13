import { TermVariable } from '../core/variable'
import { assertFunction, assertInstanceOf, assertListContent } from '../core/assert'

import { BodyTerm } from '../term/body'
import { TermLambdaTerm } from '../term/term-lambda'
import { VariableTerm } from '../term/variable'

import { Type } from '../type/type'

import { CompiledFunction } from '../compiled-term/function'

export const functionToTerm = (argTypes, returnType, func) => {
  assertFunction(func)
  assertInstanceOf(returnType, Type)

  assertListContent(argTypes, Type)

  const argVars = argTypes.map(argType =>
    [new TermVariable('_'), argType])

  const argTerms = argVars.map(
    ([argVar, argType]) =>
      new VariableTerm(argVar, argType))

  const bodyTerm = new BodyTerm(
    argTerms, returnType,
    () => func)

  const lambdaTerm = argVars.reduceRight(
    (term, [argVar, argType]) =>
      new TermLambdaTerm(argVar, argType, term),
    bodyTerm)

  return lambdaTerm
}

export const wrapFunction = (func, argTypes, returnType) => {
  const lambdaTerm = functionToTerm(argTypes, returnType, func)

  return new CompiledFunction(lambdaTerm, func)
}

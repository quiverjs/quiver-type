import {
  assertFunction,
  assertInstanceOf,
  assertArrayContent
} from '../core/assert'

import {
  varTerm, body, lambda
} from '../term/dsl'

import { arrow } from '../type/dsl'

import { termVar } from './variable'

import { Type } from '../type/type'

import { TypedFunction } from '../compiled/function'

export const functionTerm = (argTypes, returnType, func) => {
  assertArrayContent(argTypes, Type)
  assertInstanceOf(returnType, Type)
  assertFunction(func)

  const argVars = argTypes.map((argType, index) =>
    [termVar(`_${index}`), argType])

  const argTerms = argVars.map(
    ([argVar, argType]) =>
      varTerm(argVar, argType))

  return lambda(
    argVars,
    body(argTerms, returnType, func))
}

export const typedFunction = (argTypes, returnType, func) => {
  assertInstanceOf(returnType, Type)
  assertArrayContent(argTypes, Type)
  assertFunction(func)

  const arrowType = arrow(...argTypes, returnType)
  const compiledArrow = arrowType.compileType()

  return new TypedFunction(compiledArrow, func)
}

import { List } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import { TypeEnv, emptyEnv } from '../core/env'
import { TermVariable, TypeVariable } from '../core/variable'
import { assertType, assertListContent } from '../core/assert'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { Expression } from './expression'
import { TermLambdaExpression } from './term-lambda'

const $leftExpr = Symbol('@leftExpr')
const $rightExpr = Symbol('@rightExpr')

const compileExprApplication = (expr, closureSpecs, argExtractors) => {
  const compiledBody = expr.compileBody(closureSpecs)

  return (...args) => {
    const closure = compiledBody(...args)

    const inArgs = argExtractors.map(
      extractArg => extractArg(...args))

    return closure(...inArgs)
  }
}

const partialWrap = (closure, partialArgs) =>
  (...restArgs) => {
    return closure(...partialArgs, ...restArgs)
  }

const compilePartialExprApplication = (expr, closureSpecs, argExtractors) => {
  const compiledBody = expr.compileBody(closureSpecs)

  return (...args) => {
    const closure = compiledBody(...args)

    const partialArgs = argExtractors.map(
      extractArg => extractArg(...args))

    return partialWrap(closure, partialArgs)
  }
}

export class TermApplicationExpression extends Expression {
  constructor(leftExpr, rightExpr) {
    assertType(leftExpr, Expression)
    assertType(rightExpr, Expression)

    const env = new TypeEnv()

    const leftType = leftExpr.exprType(env)

    assertType(leftType, ArrowType,
      'type of leftExpr must be arrow type')

    const argType = leftType.leftType
    const rightType = rightExpr.exprType(env)

    argType.typeCheck(rightType)

    super()

    this[$leftExpr] = leftExpr
    this[$rightExpr] = rightExpr
  }

  get leftExpr() {
    return this[$leftExpr]
  }

  get rightExpr() {
    return this[$rightExpr]
  }

  exprType(env) {
    // Term application reduces the left type from (a -> b) to b
    return this.leftExpr.exprType(env).rightType
  }

  freeTermVariables() {
    const { leftExpr, rightExpr } = this
    return leftExpr.freeTermVariables()
      .union(rightExpr.freeTermVariables())
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    if(!this.freeTermVariables().has(termVar))
      return this

    const { leftExpr, rightExpr } = this

    const newLeftExpr = leftExpr.bindTerm(termVar, expr)
    const newRightExpr = rightExpr.bindTerm(termVar, expr)

    return new TermApplicationExpression(newLeftExpr, newRightExpr)
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { leftExpr, rightExpr } = this

    const newLeftExpr = leftExpr.bindType(typeVar, type)
    const newRightExpr = rightExpr.bindType(typeVar, type)

    if((newLeftExpr === leftExpr) && (newRightExpr === rightExpr))
      return this

    return new TermApplicationExpression(newLeftExpr, newRightExpr)
  }

  evaluate() {
    const { leftExpr, rightExpr } = this

    const newLeftExpr = leftExpr.evaluate()
    const newRightExpr = rightExpr.evaluate()

    if((newLeftExpr instanceof TermLambdaExpression) &&
        newRightExpr.isTerminal())
    {
      return newLeftExpr.applyExpr(newRightExpr).evaluate()

    } else if(leftExpr === newLeftExpr && rightExpr === newRightExpr) {
      return this

    } else {
      return new TermApplicationExpression(newLeftExpr, newRightExpr)

    }
  }

  compileBody(argSpecs) {
    return this.compileApplication(argSpecs, List(), this.isPartial())
  }

  compileApplication(closureSpecs, argExtractors, isPartial) {
    assertListContent(closureSpecs, ArgSpec)
    assertListContent(argExtractors, Function)

    const { leftExpr, rightExpr } = this

    const argExtractor = rightExpr.compileBody(closureSpecs)

    const inArgExtractors = argExtractors.unshift(argExtractor)

    if(leftExpr instanceof TermApplicationExpression) {
      return leftExpr.compileApplication(closureSpecs, inArgExtractors, isPartial)

    } else if(isPartial) {
      return compilePartialExprApplication(leftExpr, closureSpecs, inArgExtractors)

    } else {
      return compileExprApplication(leftExpr, closureSpecs, inArgExtractors)
    }
  }

  isTerminal() {
    return false
  }

  isPartial() {
    return this.exprType(emptyEnv) instanceof ArrowType
  }
}

import { List } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import { CompiledFunction } from '../compiled/function'
import { TermVariable, TypeVariable } from '../core/variable'
import { assertType, assertListContent } from '../core/assert'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { Expression } from './expression'
import { TermLambdaExpression } from './term-lambda'

const $type = Symbol('@type')
const $leftExpr = Symbol('@leftExpr')
const $rightExpr = Symbol('@rightExpr')

const compileExprApplication = (expr, closureSpecs, argExtractors) => {
  const compiledBody = expr.compileBody(closureSpecs)

  return (...args) => {
    const closure = compiledBody(...args)

    const inArgs = argExtractors.map(
      extractArg => extractArg(...args))

    return closure.call(...inArgs)
  }
}

const partialWrap = (closure, partialArgs) =>
  (...restArgs) => {
    return closure.call(...partialArgs, ...restArgs)
  }

const compilePartialExprApplication = (expr, closureSpecs, argExtractors, partialExpr) => {
  const compiledBody = expr.compileBody(closureSpecs)

  return (...args) => {
    const closure = compiledBody(...args)

    const partialArgs = argExtractors.map(
      extractArg => extractArg(...args))

    const partialFunc = partialWrap(closure, partialArgs)

    return new CompiledFunction(partialExpr, partialFunc)
  }
}

export class TermApplicationExpression extends Expression {
  constructor(leftExpr, rightExpr) {
    assertType(leftExpr, Expression)
    assertType(rightExpr, Expression)

    const leftType = leftExpr.exprType()

    assertType(leftType, ArrowType,
      'type of leftExpr must be arrow type')

    const argType = leftType.leftType
    const rightType = rightExpr.exprType()

    argType.typeCheck(rightType)

    // Term application reduces the left type from (a -> b) to b
    const selfType = leftType.rightType

    super()

    this[$leftExpr] = leftExpr
    this[$rightExpr] = rightExpr
    this[$type] = selfType
  }

  get leftExpr() {
    return this[$leftExpr]
  }

  get rightExpr() {
    return this[$rightExpr]
  }

  exprType() {
    return this[$type]
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    const { leftExpr, rightExpr } = this

    leftExpr.validateVarType(termVar, type)
    rightExpr.validateVarType(termVar, type)
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
    const partialExpr = this.isPartial() ? this : null
    return this.compileApplication(argSpecs, List(), partialExpr)
  }

  compileApplication(closureSpecs, argExtractors, partialExpr) {
    assertListContent(closureSpecs, ArgSpec)
    assertListContent(argExtractors, Function)

    const { leftExpr, rightExpr } = this

    const argExtractor = rightExpr.compileBody(closureSpecs)

    const inArgExtractors = argExtractors.unshift(argExtractor)

    if(leftExpr instanceof TermApplicationExpression) {
      return leftExpr.compileApplication(closureSpecs, inArgExtractors, partialExpr)

    } else if(partialExpr) {
      return compilePartialExprApplication(leftExpr, closureSpecs, inArgExtractors, partialExpr)

    } else {
      return compileExprApplication(leftExpr, closureSpecs, inArgExtractors)
    }
  }

  isTerminal() {
    return false
  }

  isPartial() {
    return this.exprType() instanceof ArrowType
  }
}

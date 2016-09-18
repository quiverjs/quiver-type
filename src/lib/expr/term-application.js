import { TypeEnv } from '../core/env'
import { assertType } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { Expression } from './expression'
import { TermLambdaExpression } from './term-lambda'

const $leftExpr = Symbol('@leftExpr')
const $rightExpr = Symbol('@rightExpr')

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

  getType(env) {
    // Term application reduces the left type from (a -> b) to b
    return this.leftExpr.getType(env).rightType
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

  isTerminal() {
    return false
  }
}

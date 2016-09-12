import { assertType } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ForAllType } from '../type/forall'

import { Expression } from './expression'

const $typeVar = Symbol('@typeVar')
const $bodyExpr = Symbol('@bodyExpr')

export class TypeLambdaExpression extends Expression {
  // constructor :: TypeVariable -> Expression -> ()
  constructor(typeVar, bodyExpr) {
    assertType(typeVar, TypeVariable)
    assertType(bodyExpr, Expression)

    super()

    this[$typeVar] = typeVar
    this[$bodyExpr] = bodyExpr
  }

  get typeVar() {
    return this[$typeVar]
  }

  get bodyExpr() {
    return this[$bodyExpr]
  }

  freeTermVariables() {
    return this.bodyExpr.freeTermVariables()
  }

  // Type of type lambda is Forall a. t
  exprType(env) {
    const { typeVar, bodyExpr } = this
    return new ForAllType(typeVar, bodyExpr.getType(env))
  }

  bindType(targetTypeVar, type) {
    assertType(targetTypeVar, TypeVariable)
    assertType(type, Type)

    const { typeVar, bodyExpr } = this

    if(targetTypeVar === typeVar)
      return this

    const newBodyExpr = bodyExpr.bindType(targetTypeVar, type)

    if(newBodyExpr === bodyExpr)
      return this

    return new TypeLambdaExpression(typeVar, newBodyExpr)
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { typeVar, bodyExpr } = this

    const newBodyExpr = bodyExpr.bindTerm(termVar, expr)

    if(newBodyExpr === bodyExpr)
      return this

    return new TypeLambdaExpression(typeVar, newBodyExpr)
  }

  evaluate() {
    const { typeVar, bodyExpr } = this

    const newBodyExpr = bodyExpr.evaluate()

    if(newBodyExpr === bodyExpr)
      return this

    return new TypeLambdaExpression(typeVar, newBodyExpr)
  }

  // applyType :: Type -> Expr
  // Apply a type to the type lambda
  applyType(type) {
    assertType(type, Type)

    const { typeVar, bodyExpr } = this
    return bodyExpr.bindType(typeVar, type)
  }

  isTerminal() {
    return false
  }
}

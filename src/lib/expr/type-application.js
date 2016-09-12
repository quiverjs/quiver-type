import { TypeEnv } from '../core/env'
import { assertType } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ForAllType } from '../type/forall'

import { Expression } from './expression'
import { TypeLambdaExpression } from './type-lambda'

const $expr = Symbol('@expr')
const $type = Symbol('@type')

export class TypeApplicationExpression extends Expression {
  // constructor :: Expr -> Type -> ()
  constructor(expr, type) {
    assertType(expr, Expression)
    assertType(type, Type)

    const exprType = expr.exprType(new TypeEnv())

    assertType(exprType, ForAllType,
      'applied expression must have forall type')

    super()

    this[$expr] = expr
    this[$type] = type
  }

  get expr() {
    return this[$expr]
  }

  get type() {
    return this[$type]
  }

  freeTermVariables() {
    return this.expr.freeTermVariables()
  }

  exprType(env) {
    assertType(env, TypeEnv)

    const { expr, type } = this

    // exprType should be ForAllType
    const exprType = expr.exprType(env)

    assertType(exprType, ForAllType,
      'applied expression must have forall type')

    // Type of type lambda application is from (Forall a. e) to ([a->T] e)
    return exprType.applyType(type)
  }

  bindTerm(termVar, targetExpr) {
    assertType(termVar, TermVariable)
    assertType(targetExpr, Expression)

    const { expr, type } = this

    const newExpr = expr.bindTerm(termVar, targetExpr)

    if(newExpr === expr)
      return this

    return new TypeApplicationExpression(newExpr, type)
  }

  bindType(typeVar, targetType) {
    assertType(typeVar, TypeVariable)
    assertType(targetType, Type)

    const { expr, type } = this

    const newExpr = expr.bindType(typeVar, targetType)
    const newType = type.bindType(typeVar, targetType)

    if((newExpr === expr) && (newType === type))
      return this

    return new TypeApplicationExpression(newExpr, newType)
  }

  evaluate() {
    const { expr, type } = this

    const newExpr = expr.reduce

    // Only reduce the type application if type argument is terminal,
    // i.e. when type argument has no free type variable.
    if((newExpr instanceof TypeLambdaExpression) && type.isTerminal()) {
      return newExpr.applyType(type).evaluate()
    }

    if(newExpr === expr) return this

    return new TypeApplicationExpression(newExpr, type)
  }

  isTerminal() {
    return false
  }
}

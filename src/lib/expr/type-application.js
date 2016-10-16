import { assertType } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ForAllType } from '../type/forall'
import { ArrowKind } from '../kind/arrow'

import { Expression } from './expression'
import { TypeLambdaExpression } from './type-lambda'

const $leftExpr = Symbol('@leftExpr')
const $rightType = Symbol('@rightType')
const $selfType = Symbol('@selfType')

export class TypeApplicationExpression extends Expression {
  // constructor :: Expr -> Type -> ()
  constructor(leftExpr, rightType) {
    assertType(leftExpr, Expression)
    assertType(rightType, Type)

    const leftType = leftExpr.exprType()
    const leftKind = leftType.typeKind()

    assertType(leftKind, ArrowKind)

    const selfType = leftType.applyType(rightType)

    super()

    this[$leftExpr] = leftExpr
    this[$rightType] = rightType
    this[$selfType] = selfType
  }

  get leftExpr() {
    return this[$leftExpr]
  }

  get rightType() {
    return this[$rightType]
  }

  freeTermVariables() {
    return this.leftExpr.freeTermVariables()
  }

  exprType() {
    return this[$selfType]
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    const { leftExpr, rightType } = this

    try {
      leftExpr.validateVarType(termVar, type)
    } catch(err) {
      leftExpr.applyType(rightType).validateVarType(termVar, type)
    }
  }

  bindTerm(termVar, targetExpr) {
    assertType(termVar, TermVariable)
    assertType(targetExpr, Expression)

    const { leftExpr, rightType } = this

    const newExpr = expr.bindTerm(termVar, targetExpr)

    if(newExpr === leftExpr)
      return this

    return new TypeApplicationExpression(newExpr, rightType)
  }

  bindType(typeVar, targetType) {
    assertType(typeVar, TypeVariable)
    assertType(targetType, Type)

    const { leftExpr, rightType } = this

    const newExpr = leftExpr.bindType(typeVar, targetType)
    const newType = rightType.bindType(typeVar, targetType)

    if((newExpr === leftExpr) && (newType === rightType))
      return this

    return new TypeApplicationExpression(newExpr, newType)
  }

  evaluate() {
    const { leftExpr, rightType } = this

    const newExpr = leftExpr.evaluate()

    // Only reduce the type application if type argument is terminal,
    // i.e. when type argument has no free type variable.
    if((newExpr instanceof TypeLambdaExpression) && rightType.isTerminal()) {
      return newExpr.applyType(rightType).evaluate()

    } else if(newExpr === leftExpr) {
      return this

    } else {
      return new TypeApplicationExpression(newExpr, rightType)
    }
  }

  isTerminal() {
    return false
  }
}

import { assertType, assertNoError } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'
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
    const rightKind = rightType.typeKind()

    assertType(leftKind, ArrowKind)
    assertNoError(leftKind.leftKind.kindCheck(rightKind))

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

    const err = leftExpr.validateVarType(termVar, type)
    if(!err) return null

    const leftType = leftExpr.applyType(rightType)
    return leftType.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { leftExpr, rightType } = this

    const err = leftExpr.validateTVarKind(typeVar, kind)
    if(!err) return null

    const leftType = leftExpr.applyType(rightType).exprType()
    return leftType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, targetExpr) {
    assertType(termVar, TermVariable)
    assertType(targetExpr, Expression)

    const { leftExpr, rightType } = this

    const newExpr = leftExpr.bindTerm(termVar, targetExpr)

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

  formatExpr() {
    const { leftExpr, rightType } = this

    const leftRep = leftExpr.formatExpr()
    const rightRep = rightType.formatType()

    return ['type-app', leftRep, rightRep]
  }
}

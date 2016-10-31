import { assertType, assertNoError } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ForAllType } from '../type/forall'

import { Kind } from '../kind/kind'

import { Expression } from './expression'

const $argTVar = Symbol('@argTVar')
const $argKind = Symbol('@argKind')
const $bodyExpr = Symbol('@bodyExpr')
const $type = Symbol('@type')

export class TypeLambdaExpression extends Expression {
  // constructor :: TypeVariable -> Expression -> ()
  constructor(argTVar, argKind, bodyExpr) {
    assertType(argTVar, TypeVariable)
    assertType(argKind, Kind)
    assertType(bodyExpr, Expression)

    assertNoError(bodyExpr.validateTVarKind(argTVar, argKind))

    const type = new ForAllType(argTVar, argKind, bodyExpr.exprType())

    super()

    this[$argTVar] = argTVar
    this[$argKind] = argKind
    this[$bodyExpr] = bodyExpr
    this[$type] = type
  }

  get argTVar() {
    return this[$argTVar]
  }

  get argKind() {
    return this[$argKind]
  }

  get bodyExpr() {
    return this[$bodyExpr]
  }

  freeTermVariables() {
    return this.bodyExpr.freeTermVariables()
  }

  // Type of type lambda is Forall a. t
  exprType() {
    return this[$type]
  }

  validateVarType(termVar, type) {
    return this.bodyExpr.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { argTVar, bodyExpr } = this

    if(argTVar === typeVar)
      return null

    return bodyExpr.validateTVarKind(typeVar, kind)
  }

  bindType(targetTypeVar, type) {
    assertType(targetTypeVar, TypeVariable)
    assertType(type, Type)

    const { argTVar, argKind, bodyExpr } = this

    if(targetTypeVar === argTVar)
      return this

    const newBodyExpr = bodyExpr.bindType(targetTypeVar, type)

    if(newBodyExpr === bodyExpr)
      return this

    return new TypeLambdaExpression(argTVar, argKind, newBodyExpr)
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { argTVar, argKind, bodyExpr } = this

    const newBodyExpr = bodyExpr.bindTerm(termVar, expr)

    if(newBodyExpr === bodyExpr)
      return this

    return new TypeLambdaExpression(argTVar, argKind, newBodyExpr)
  }

  evaluate() {
    const { argTVar, argKind, bodyExpr } = this

    const newBodyExpr = bodyExpr.evaluate()

    if(newBodyExpr === bodyExpr)
      return this

    return new TypeLambdaExpression(argTVar, argKind, newBodyExpr)
  }

  // applyType :: Type -> Expr
  // Apply a type to the type lambda
  applyType(type) {
    assertType(type, Type)

    const { argTVar, argKind, bodyExpr } = this
    assertNoError(argKind.kindCheck(type.typeKind()))

    return bodyExpr.bindType(argTVar, type)
  }

  formatExpr() {
    const { argTVar, argKind, bodyExpr } = this

    const argTVarRep = argTVar.name
    const argKindRep = argKind.formatKind()
    const bodyRep = bodyExpr.formatExpr()

    return ['type-lambda', [argTVarRep, argKindRep], bodyRep]
  }
}

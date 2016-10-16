import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertListContent, assertType,
  assertFunction, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { Expression } from './expression'

const $argExprs = Symbol('@argExprs')
const $returnType = Symbol('@returnType')
const $func = Symbol('@func')

export class RawBodyExpression extends Expression {
  // constructor :: List Expression -> Type -> Function -> ()
  constructor(argExprs, returnType, func) {
    assertListContent(argExprs, Expression)

    assertType(returnType, Type)
    assertFunction(func)

    super()

    this[$argExprs] = argExprs
    this[$returnType] = returnType
    this[$func] = func
  }

  get argExprs() {
    return this[$argExprs]
  }

  get returnType() {
    return this[$returnType]
  }

  get func() {
    return this[$func]
  }

  freeTermVariables() {
    return this.argExprs::unionMap(
      argExpr => argExpr.freeTermVariables())
  }

  exprType() {
    return this.returnType
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    for(const expr of this.argExprs) {
      const err = expr.validateVarType(termVar, type)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    for(const expr of this.argExprs) {
      const err = expr.validateTVarKind(termVar, type)
      if(err) return err
    }

    return null
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)
    
    const { argExprs, returnType, func } = this

    const [newArgExprs, exprModified] = argExprs::mapUnique(
      argExpr => argExpr.bindTerm(termVar, expr))

    if(exprModified) {
      return new RawBodyExpression(newArgExprs, returnType, func)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { argExprs, returnType, func } = this

    const [newArgExprs, exprModified] = argExprs::mapUnique(
      argExpr => argExpr.bindType(typeVar, type))

    if(exprModified) {
      return new RawBodyExpression(newArgExprs, returnType, func)
    } else {
      return this
    }
  }

  evaluate() {
    const { argExprs, returnType, func } = this

    for(const argExpr of argExprs) {
      if(!argExpr.isTerminal()) return this
    }

    const resultExpr = func(...argExprs)

    assertType(resultExpr, Expression)
    assertNoError(returnType.typeCheck(resultExpr.exprType()))

    return resultExpr
  }

  isTerminal() {
    return false
  }
}

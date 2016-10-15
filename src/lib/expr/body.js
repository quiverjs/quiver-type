import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import {
  assertListContent, assertType, assertFunction
} from '../core/assert'

import { Type } from '../type/type'

import { Expression } from './expression'

const $argExprs = Symbol('@argExprs')
const $returnType = Symbol('@returnType')
const $func = Symbol('@func')

export class BodyExpression extends Expression {
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
    for(const expr of this.argExprs) {
      expr.validateVarType(termVar, type)
    }
  }

  bindTerm(termVar, expr) {
    const { argExprs, returnType, func } = this

    const [newArgExprs, exprModified] = argExprs::mapUnique(
      argExpr => argExpr.bindTerm(termVar, expr))

    if(exprModified) {
      return new BodyExpression(newArgExprs, returnType, func)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    const { argExprs, returnType, func } = this

    const [newArgExprs, exprModified] = argExprs::mapUnique(
      argExpr => argExpr.bindType(typeVar, type))

    if(exprModified) {
      return new BodyExpression(newArgExprs, returnType, func)
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
    returnType.typeCheck(resultExpr.exprType())

    return resultExpr
  }

  isTerminal() {
    return false
  }
}

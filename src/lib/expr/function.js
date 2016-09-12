import { assertList, assertType, assertFunction } from '../core/assert'
import { Type } from '../type/type'

import { Expression } from './expression'

const $argExprs = Symbol('@argExprs')
const $returnType = Symbol('@returnType')
const $func = Symbol('@func')

export class FunctionExpression extends Expression {
  // constructor :: List Expression -> Type -> Function -> ()
  constructor(argExprs, returnType, func) {
    assertList(argExprs)

    for(const argVar of argExprs) {
      assertType(argVar, Expression)
    }

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
    return this.argExprs.reduce(
      (result, argExpr) =>
        result.union(argExpr.freeTermVariables()),
      Set())
  }

  exprType(env) {
    return this.returnType
  }

  bindTerm(termVar, expr) {
    return this
  }

  bindType() {
    return this
  }

  evaluate() {
    const { argExprs, returnType, func } = this

    for(const argExpr of argExprs) {
      if(!argExpr.isTerminal()) return this
    }

    const resultExpr = this.func(...argExprs)

    assertType(resultExpr, Expression)
    returnType.typeCheck(resultExpr.exprType())

    return resultExpr
  }

  isTerminal() {
    return false
  }
}

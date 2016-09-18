import { Set, unionMap } from '../core/container'
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
    return this.argExprs::unionMap(
      argExpr => argExpr.freeTermVariables())
  }

  exprType(env) {
    for(const expr of this.argExprs) {
      expr.exprType(env)
    }

    return this.returnType
  }

  bindTerm(termVar, expr) {
    const { argExprs, returnType, func } = this

    let exprModified = false
    const newArgExprs = argExprs.map(
      argExpr => {
        const newArgExpr = argExpr.bindTerm(termVar, expr)

        if(newArgExpr !== argExpr)
          exprModified = true

        return newArgExpr
      })

    if(!exprModified) return this

    return new FunctionExpression(newArgExprs, returnType, func)
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

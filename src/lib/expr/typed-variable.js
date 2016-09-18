import { TypeEnv } from '../core/env'
import { Set } from '../core/container'
import { assertType } from '../core/assert'
import { TermVariable } from '../core/variable'

import { Type } from '../type/type'

import { Expression } from './expression'

const $termVar = Symbol('@termVar')
const $varType = Symbol('@varType')

export class TypedVariableExpression extends Expression {
  constructor(termVar, varType) {
    assertType(termVar, TermVariable)
    assertType(varType, Type)

    super()

    this[$termVar] = termVar
    this[$varType] = varType
  }

  get termVar() {
    return this[$termVar]
  }

  get varType() {
    return this[$varType]
  }

  freeTermVariables() {
    return Set([this.termVar])
  }

  exprType(env) {
    assertType(env, TypeEnv)

    const { termVar, varType } = this

    const type = env.get(termVar)
    if(!type) return varType

    varType.typeCheck(type)

    return type
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    if(this.termVar !== termVar)
      return this

    const exprType = expr.exprType(new TypeEnv())
    this.varType.typeCheck(exprType)

    return expr
  }

  bindType(typeVar, type) {
    const { termVar, varType } = this

    const newVarType = varType.bindType(typeVar, type)
    if(newVarType === varType)
      return this

    return new TypedVariableExpression(typevar, newVarType)
  }

  evaluate() {
    return this
  }

  isTerminal() {
    return false
  }
}

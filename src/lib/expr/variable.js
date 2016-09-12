import { TypeEnv } from '../core/env'
import { Set } from '../core/container'
import { assertType } from '../core/assert'
import { TermVariable } from '../core/variable'

import { Expression } from './expression'

const $termVar = Symbol('@termVar')

export class VariableExpression extends Expression {
  constructor(termVar) {
    assertType(termVar, TermVariable)

    super()

    this[$termVar] = termVar
  }

  get termVar() {
    return this[$termVar]
  }

  freeTermVariables() {
    return Set([this.termVar])
  }

  exprType(env) {
    assertType(env, TypeEnv)

    const type = env.get(this.termVar)

    if(!type)
      throw new Error('type of term variable is not bound in typeEnv')

    return type
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    if(this.termVar === termVar) {
      return expr
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    return this
  }

  evaluate() {
    return this
  }

  isTerminal() {
    return false
  }
}

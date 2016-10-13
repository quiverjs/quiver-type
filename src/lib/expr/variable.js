import { TypeEnv } from '../core/env'
import { Set } from '../core/container'
import { TermVariable } from '../core/variable'
import { TypedVariable } from '../core/typed-variable'
import { assertType, assertListContent } from '../core/assert'

import { Expression } from './expression'

const $termVar = Symbol('@termVar')

const findArgIndex = (argSpecs, termVar) => {
  let index = -1
  const argSize = argSpecs.size

  for(let i=0; i<argSize; i++) {
    const [argVar] = argSpecs.get(i)
    if(argVar === termVar) {
      index = i
    }
  }

  if(index === -1)
    throw new Error(`term variable ${termVar} not found in argSpecs.`)

  return index
}

const argPicker = index =>
  (...args) =>
    args[index]

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

  compileBody(argSpecs) {
    assertListContent(argSpecs, TypedVariable)
    const { termVar } = this

    const argIndex = findArgIndex(argSpecs, termVar)
    return argPicker(argIndex)
  }

  isTerminal() {
    return false
  }
}

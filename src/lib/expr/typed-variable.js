import { TypeEnv } from '../core/env'
import { Set } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import { TermVariable } from '../core/variable'
import { assertType, assertListContent } from '../core/assert'

import { Type } from '../type/type'

import { Expression } from './expression'

const $termVar = Symbol('@termVar')
const $varType = Symbol('@varType')

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

    return new TypedVariableExpression(termVar, newVarType)
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)
    const { termVar, varType } = this

    const argIndex = findArgIndex(argSpecs, termVar)
    varType.typeCheck(argSpecs.get(argIndex).compiledType.srcType)

    return argPicker(argIndex)
  }

  evaluate() {
    return this
  }

  isTerminal() {
    return false
  }
}

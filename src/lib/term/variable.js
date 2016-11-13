import { Set } from '../core/container'
import { ArgSpec } from '../compiled-term/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertType, assertListContent, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { Term } from './term'

const $termVar = Symbol('@termVar')
const $varType = Symbol('@varType')

const findArgIndex = (argSpecs, termVar) => {
  let index = -1
  let foundArgSpec = null

  const argSize = argSpecs.size

  for(let i=0; i<argSize; i++) {
    const argSpec = argSpecs.get(i)
    const argVar = argSpec.termVar
    if(argVar === termVar) {
      index = i
      foundArgSpec = argSpec
    }
  }

  if(index === -1)
    throw new Error(`term variable ${termVar} not found in argSpecs.`)

  return [index, foundArgSpec]
}

const argPicker = index =>
  (...args) => {
    return args[index]
  }

export class VariableTerm extends Term {
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

  termType() {
    return this.varType
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    if(this.termVar !== termVar)
      return null

    return this.varType.typeCheck(type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { varType } = this
    return varType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertType(termVar, TermVariable)
    assertType(term, Term)

    if(this.termVar !== termVar)
      return this

    const termType = term.termType()
    assertNoError(this.varType.typeCheck(termType))

    return term
  }

  bindType(typeVar, type) {
    const { termVar, varType } = this

    const newVarType = varType.bindType(typeVar, type)
    if(newVarType === varType)
      return this

    return new VariableTerm(termVar, newVarType)
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)
    const { termVar, varType } = this

    const [argIndex, argSpec] = findArgIndex(argSpecs, termVar)

    assertNoError(varType.typeCheck(argSpec.compiledType.srcType))

    return argPicker(argIndex)
  }

  evaluate() {
    return this
  }

  formatTerm() {
    const { termVar } = this
    const varRep = termVar.name

    return ['var', varRep]
  }
}

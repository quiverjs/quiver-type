import { ISet } from '../core/container'
import { ArgSpec } from '../compiled-term/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertInstanceOf, assertListContent, assertNoError
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
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(varType, Type)

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
    return ISet([this.termVar])
  }

  termType() {
    return this.varType
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    if(this.termVar !== termVar)
      return null

    return this.varType.typeCheck(type)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { varType } = this
    return varType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

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

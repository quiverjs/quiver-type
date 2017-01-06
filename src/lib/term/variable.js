import { ISet } from '../core/container'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertInstanceOf, assertListContent, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { Term } from './term'
import { ArgSpec } from './arg-spec'

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
  closureArgs =>
    closureArgs[index]

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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof VariableTerm))
      return new TypeError('target term must be VariableTerm')

    const { termVar, varType } = this

    if(termVar !== targetTerm.termVar)
      return new TypeError('term variable mismatch')

    return varType.typeCheck(targetTerm.varType)
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

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)
    const { termVar, varType } = this

    const [argIndex, argSpec] = findArgIndex(closureSpecs, termVar)

    const argSpecType = argSpec.compiledType.srcType

    assertNoError(varType.typeCheck(argSpecType))

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

export const varTerm = (termVar, varType) => {
  return new VariableTerm(termVar, varType)
}

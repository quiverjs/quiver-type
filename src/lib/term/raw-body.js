import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertListContent, assertType,
  assertFunction, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { isTerminalTerm } from '../util/terminal'

import { Term } from './term'

const $argTerms = Symbol('@argTerms')
const $returnType = Symbol('@returnType')
const $func = Symbol('@func')

export class RawBodyTerm extends Term {
  // constructor :: List Term -> Type -> Function -> ()
  constructor(argTerms, returnType, func) {
    assertListContent(argTerms, Term)

    assertType(returnType, Type)
    assertFunction(func)

    super()

    this[$argTerms] = argTerms
    this[$returnType] = returnType
    this[$func] = func
  }

  get argTerms() {
    return this[$argTerms]
  }

  get returnType() {
    return this[$returnType]
  }

  get func() {
    return this[$func]
  }

  freeTermVariables() {
    return this.argTerms::unionMap(
      argTerm => argTerm.freeTermVariables())
  }

  termType() {
    return this.returnType
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    for(const term of this.argTerms) {
      const err = term.validateVarType(termVar, type)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    for(const term of this.argTerms) {
      const err = term.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindTerm(termVar, term) {
    assertType(termVar, TermVariable)
    assertType(term, Term)

    const { argTerms, returnType, func } = this

    const [newArgTerms, termModified] = argTerms::mapUnique(
      argTerm => argTerm.bindTerm(termVar, term))

    if(termModified) {
      return new RawBodyTerm(newArgTerms, returnType, func)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { argTerms, returnType, func } = this

    const [newArgTerms, termModified] = argTerms::mapUnique(
      argTerm => argTerm.bindType(typeVar, type))

    const newReturnType = returnType.bindType(typeVar, type)

    if(termModified || newReturnType !== returnType) {
      return new RawBodyTerm(newArgTerms, returnType, func)
    } else {
      return this
    }
  }

  evaluate() {
    const { argTerms, returnType, func } = this

    for(const argTerm of argTerms) {
      if(!isTerminalTerm(argTerm)) return this
    }

    const resultTerm = func(...argTerms)

    assertType(resultTerm, Term)
    assertNoError(returnType.typeCheck(resultTerm.termType()))

    return resultTerm
  }

  formatTerm() {
    const { argTerms, returnType } = this

    const argTermsRep = [...argTerms.map(term => term.formatTerm())]
    const returnTypeRep = returnType.formatType()

    return ['raw-body', argTermsRep, returnTypeRep]
  }
}

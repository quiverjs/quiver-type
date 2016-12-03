import { ISet } from '../core/container'
import { assertInstanceOf } from '../core/assert'

import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { unitType } from '../type/unit'

import { Term } from './term'

const unitValue = Symbol('unit')

export class UnitTerm extends Term {
  constructor() {
    super()
  }

  freeTermVariables() {
    return ISet()
  }

  termType() {
    return unitType
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)
    
    if(targetTerm === this) return null

    if(targetTerm instanceof UnitTerm) {
      return null
    } else {
      return new TypeError('target term must be unit term')
    }
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    return null
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    return this
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    return this
  }

  evaluate() {
    return this
  }

  compileBody(argSpecs) {
    return (...args) => unitValue
  }

  formatTerm() {
    return ['unit-term']
  }
}

export const unitTerm = new UnitTerm()

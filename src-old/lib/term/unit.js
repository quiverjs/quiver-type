import { ISet } from '../core/container'
import {
  assertFunction,
  assertInstanceOf,
  assertListContent
} from '../core/assert'

import { unitType } from '../type/unit'

import { Term } from './term'
import { ArgSpec } from './arg-spec'

export const unitValue = Symbol('unit')

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

  *subTerms() {
    // empty
  }

  *subTypes() {
    // empty
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    return this
  }

  evaluate() {
    return this
  }

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    return closureArgs => unitValue
  }

  formatTerm() {
    return ['unit-term']
  }
}

export const unitTerm = new UnitTerm()

export const unit = unitValue

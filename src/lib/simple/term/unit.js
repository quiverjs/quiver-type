import { termImpl } from './impl'
import { Term } from './term'
import { unitType } from '../type/unit'
import { ValueClosure } from '../closure/value'
import { emptySet } from '../../container'

const unitClosure = new ValueClosure(unitType, null)

export const UnitTerm = termImpl(
  class extends Term {
    termType() {
      return unitType
    }

    freeTermVariables() {
      return emptySet
    }

    validateVarType(termVar, type) {
      return null
    }

    bindTerm(termVar, term) {
      return this
    }

    normalForm() {
      return this
    }

    compileClosure(argVars) {
      return unitClosure
    }

    isTerminal() {
      return true
    }

    formatTerm() {
      return ['unit-term']
    }
  })

export const unitTerm = new UnitTerm()

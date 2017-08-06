import { Term } from './term'
import { termImpl } from './impl'
import { assertType } from '../type/type'
import { assertVariable } from './assert'
import { setWithValue } from '../../container'
import { isArrowType } from '../type/arrow'
import { VariableClosure, ArrowVariableClosure } from '../closure/variable'

const $termVar = Symbol('@termVar')
const $varType = Symbol('@varType')

const findArgIndex = (argVars, termVar, i) => {
  if(argVars.isNil())
    throw new Error(`term variable ${termVar} is not found in argVars ${[...argVars]}`)

  const { item, next } = argVars
  if(item === termVar) {
    return i
  } else {
    return findArgIndex(next, termVar, i+1)
  }
}

export const VariableTerm = termImpl(
  class extends Term {
    constructor(termVar, varType) {
      assertVariable(termVar)
      assertType(varType)

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

    termType() {
      return this.varType
    }

    freeTermVariables() {
      return setWithValue(this.termVar)
    }

    bindTerm(termVar, term) {
      if(this.termVar === termVar) {
        const err = this.varType.checkTerm(term)
        if(err) throw err

        return term
      } else {
        return this
      }
    }

    validateVarType(termVar, type) {
      if(termVar === this.termVar) {
        return this.varType.checkType(type)
      } else {
        return null
      }
    }

    normalForm() {
      return this
    }

    compileClosure(argVars) {
      const { termVar, varType } = this
      const argIndex = findArgIndex(argVars, termVar, 0)

      if(isArrowType(varType)) {
        return new ArrowVariableClosure(argIndex)
      } else {
        return new VariableClosure(argIndex)
      }
    }

    isTerminal() {
      return true
    }

    formatTerm() {
      const { termVar, varType } = this
      const typeRep = varType.formatType()

      return ['var-term', termVar, typeRep]
    }
  })

export const varTerm = (termVar, varType) =>
  new VariableTerm(termVar, varType)

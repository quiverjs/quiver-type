import { Term } from './term'
import { termImpl } from './impl'
import { assertType } from '../type/type'
import { assertVariable } from './assert'
import { setWithValue } from '../container'
import { VariableClosure } from '../closure/variable'

const $termVar = Symbol('@termVar')
const $varType = Symbol('@varType')

const findArgIndex = (argVars, termVar) => {
  for(let i=argVars.size-1; i>=0; i++) {
    const argVar = argVars.get(i)
    if(argVar === termVar) {
      return i
    }
  }

  throw new Error(`term variable ${termVar.toString()} not found in argVars`)
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
        return term
      } else {
        return this
      }
    }

    weakHeadNormalForm() {
      return this
    }

    normalForm() {
      return this
    }

    compileClosure(argVars) {
      const { termVar } = this
      const argIndex = findArgIndex(argVars, termVar)

      return new VariableClosure(argIndex)
    }
  })

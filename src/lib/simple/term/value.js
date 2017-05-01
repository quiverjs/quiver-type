import { Term } from './term'
import { termImpl } from './impl'
import { emptySet } from '../container'

const $value = Symbol('@value')

export const ValueTerm = termImpl(
  class extends Term {
    constructor(value) {
      super()

      this[$value] = value
    }

    get value() {
      return this[$value]
    }

    freeTermVariables() {
      return emptySet
    }

    bindTerm(termVar) {
      return this
    }

    weakHeadNormalForm() {
      return this
    }

    normalForm() {
      return this
    }

    compileClosure(argVars) {
      const { value } = this

      return () => value
    }
  })

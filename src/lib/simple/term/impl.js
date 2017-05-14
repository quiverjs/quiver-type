import { assertVariable } from './assert'

import { assertTerm } from './term'
import { assertKeywordNode } from '../../container'

const $freeTermVars = Symbol('@freeTermVars')
const $weakHeadNF = Symbol('@weakHeadNF')
const $normalForm = Symbol('@normalForm')

export const termImpl = ParentTerm =>
  class extends ParentTerm {
    freeTermVariables() {
      if(!this[$freeTermVars]) {
        this[$freeTermVars] = super.freeTermVariables()
      }

      return this[$freeTermVars]
    }

    bindTerm(termVar, term) {
      assertVariable(termVar)
      assertTerm(term)

      return super.bindTerm(termVar, term)
    }

    weakHeadNormalForm() {
      if(!this[$weakHeadNF]) {
        this[$weakHeadNF] = super.weakHeadNormalForm()
      }

      return this[$weakHeadNF]
    }

    normalForm() {
      if(!this[$normalForm]) {
        this[$normalForm] = super.normalForm()
      }

      return this[$normalForm]
    }

    compileClosure(closureVars) {
      assertKeywordNode(closureVars)
      return super.compileClosure(closureVars)
    }
  }

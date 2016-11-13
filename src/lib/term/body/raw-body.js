import {
  assertInstanceOf,
  assertFunction, assertNoError
} from '../../core/assert'

import { Term } from '../../term'

import { isTerminalTerm } from '../../util/terminal'

import { CommonBodyTerm, $newInstance } from './common'

const $func = Symbol('@func')

export class RawBodyTerm extends CommonBodyTerm {
  // constructor :: IList Term -> Type -> Function -> ()
  constructor(argTerms, returnType, func) {
    assertFunction(func)

    super(argTerms, returnType)

    this[$func] = func
  }

  get func() {
    return this[$func]
  }

  [$newInstance](argTerms, returnType) {
    return new RawBodyTerm(argTerms, returnType, this.func)
  }

  evaluate() {
    const { argTerms, returnType, func } = this

    for(const argTerm of argTerms) {
      if(!isTerminalTerm(argTerm)) return this
    }

    const resultTerm = func(...argTerms)

    assertInstanceOf(resultTerm, Term)
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

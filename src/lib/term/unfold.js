import {
  isInstanceOf,
  assertFunction,
  assertInstanceOf
} from '../core/assert'

import { FixedPointType } from '../type/fixed'

import { Term } from './term'

const $unfoldType = Symbol('@unfoldType')
const $bodyTerm = Symbol('@bodyTerm')

export class UnfoldTerm extends Term {
  constructor(bodyTerm) {
    assertInstanceOf(bodyTerm, Term)

    const termType = bodyTerm.termType()
    assertInstanceOf(termType, FixedPointType)

    const unfoldType = termType.unfoldType()

    super()

    this[$unfoldType] = unfoldType
    this[$bodyTerm] = bodyTerm
  }

  get unfoldType() {
    return this[$unfoldType]
  }

  get bodyTerm() {
    return this[$bodyTerm]
  }

  freeTermVariables() {
    return this.bodyTerm.freeTermVariables()
  }

  termType() {
    return this.unfoldType
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, UnfoldTerm))
      return new TypeError('target term must be an unfold term')

    return this.bodyTerm.termCheck(targetTerm.bodyTerm)
  }

  *subTerms() {
    yield this.bodyTerm
  }

  *subTypes() {
    // empty
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { bodyTerm } = this
    const newBodyTerm = termMapper(bodyTerm)

    if(newBodyTerm !== bodyTerm) {
      return new UnfoldTerm(newBodyTerm)
    } else {
      return this
    }
  }

  evaluate() {
    const { bodyTerm } = this
    const newBodyTerm = bodyTerm.evaluate()

    if(newBodyTerm !== bodyTerm) {
      return new UnfoldTerm(newBodyTerm)
    } else {
      return this
    }
  }

  compileClosure(closureSpecs) {
    return this.bodyTerm.compileClosure(closureSpecs)
  }

  formatTerm() {
    const { bodyTerm } = this

    const bodyRep = bodyTerm.formatTerm()

    return ['unfold', bodyRep]
  }
}

export const unfold = bodyTerm => {
  return new UnfoldTerm(bodyTerm)
}

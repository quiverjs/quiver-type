import {
  isInstanceOf,
  assertNoError,
  assertFunction,
  assertInstanceOf
} from '../core/assert'

import { FixedPointType } from '../type/fixed'

import { Term } from './term'

const $fixedType = Symbol('@fixedType')
const $bodyTerm = Symbol('@bodyTerm')

export class FoldTerm extends Term {
  constructor(fixedType, bodyTerm) {
    assertInstanceOf(fixedType, FixedPointType)
    assertInstanceOf(bodyTerm, Term)

    const unfoldType = fixedType.unfoldType()
    const bodyType = bodyTerm.termType()

    assertNoError(unfoldType.typeCheck(bodyType))

    super()

    this[$fixedType] = fixedType
    this[$bodyTerm] = bodyTerm
  }

  get fixedType() {
    return this[$fixedType]
  }

  get bodyTerm() {
    return this[$bodyTerm]
  }

  termType() {
    return this.fixedType
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, FoldTerm))
      return new TypeError('target term must be a fold term')

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
      return new FoldTerm(newBodyTerm)
    } else {
      return this
    }
  }

  evaluate() {
    const { bodyTerm } = this
    const newBodyTerm = bodyTerm.evaluate()

    if(newBodyTerm !== bodyTerm) {
      return new FoldTerm(newBodyTerm)
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

    return ['fold', bodyRep]
  }
}

export const fold = (fixedType, bodyTerm) =>
  new FoldTerm(fixedType, bodyTerm)

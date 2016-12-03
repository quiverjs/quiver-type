import { assertInstanceOf, isInstanceOf } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
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

  validateVarType(termVar, type) {
    return this.bodyTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    return this.bodyTerm.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { bodyTerm } = this
    const newBodyTerm = bodyTerm.bindTerm(termVar, term)

    if(newBodyTerm !== bodyTerm) {
      return new UnfoldTerm(newBodyTerm)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { bodyTerm } = this
    const newBodyTerm = bodyTerm.bindType(typeVar, type)

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

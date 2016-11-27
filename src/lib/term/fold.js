import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertInstanceOf, isInstanceOf, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
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

  freeTermVariables() {
    return this.bodyTerm.freeTermVariables()
  }

  termType() {
    return this.fixedType
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(!isInstanceOf(targetTerm, FoldTerm))
      return new TypeError('target term must be a fold term')

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
      return new FoldTerm(newBodyTerm)
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

  compileBody(closureSpecs) {
    return this.bodyTerm.compileBody(closureSpecs)
  }

  formatTerm() {
    const { bodyTerm } = this

    const bodyRep = bodyTerm.formatTerm()

    return ['fold', bodyRep]
  }
}

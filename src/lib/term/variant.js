import {
  assertInstanceOf, assertListContent,
  assertString, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
import { SumType } from '../type/sum'

import { Kind } from '../kind/kind'

import { ArgSpec } from '../compiled-term/arg-spec'

import { TermVariable, TypeVariable } from '../core/variable'

import { Term } from './term'

const $sumType = Symbol('@sumType')
const $tag = Symbol('@tag')
const $bodyTerm = Symbol('@bodyTerm')

export class VariantTerm extends Term {
  constructor(sumType, tag, bodyTerm) {
    assertInstanceOf(sumType, SumType)
    assertString(tag)
    assertInstanceOf(bodyTerm, Term)

    const caseType = sumType.typeMap.get(tag)

    if(!caseType)
      throw new TypeError(`sumType do not have constructor ${tag}`)

    const bodyType = bodyTerm.termType()
    assertNoError(caseType.typeCheck(bodyType))

    super()

    this[$sumType] = sumType
    this[$tag] = tag
    this[$bodyTerm] = bodyTerm
  }

  get sumType() {
    return this[$sumType]
  }

  get tag() {
    return this[$tag]
  }

  get bodyTerm() {
    return this[$bodyTerm]
  }

  termType() {
    return this.sumType
  }

  freeTermVariables() {
    return this.bodyTerm.freeTermVariables()
  }

  validateVarType(termVar, type) {
    return this.bodyTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { sumType, bodyTerm } = this

    const err = sumType.validateTVarKind(typeVar, kind)
    if(err) return err

    return bodyTerm.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { sumType, tag, bodyTerm } = this

    const newBodyTerm = bodyTerm.bindTerm(termVar, term)

    if(newBodyTerm !== bodyTerm) {
      return new VariantTerm(sumType, tag, newBodyTerm)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { sumType, tag, bodyTerm } = this

    const newSumType = sumType.bindType(typeVar, type)
    const newBodyTerm = bodyTerm.bindType(typeVar, type)

    if(newSumType !== sumType || newBodyTerm !== bodyTerm) {
      return new VariantTerm(newSumType, tag, newBodyTerm)

    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { sumType, tag, bodyTerm } = this

    const compiledSumType = sumType.compileType()
    const compiledBody = bodyTerm.compileBody(argSpecs)

    return (...args) => {
      const value = compiledBody(...args)
      return compiledSumType.construct(tag, value)
    }
  }

  evaluate() {
    const { sumType, tag, bodyTerm } = this

    const newBodyTerm = bodyTerm.evaluate()

    if(newBodyTerm !== bodyTerm) {
      return new VariantTerm(sumType, tag, newBodyTerm)

    } else {
      return this
    }
  }

  formatTerm() {
    const { sumType, tag, bodyTerm } = this

    const sumTypeRep = sumType.formatType()
    const bodyRep = bodyTerm.formatTerm()

    return ['variant', [sumTypeRep, tag], bodyRep]
  }
}
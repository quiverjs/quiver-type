import {
  assertInstanceOf, assertListContent,
  assertString, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
import { SumType } from '../type/sum'

import { Kind } from '../kind/kind'

import { TermVariable, TypeVariable } from '../core/variable'

import { Term } from './term'
import { ArgSpec } from './arg-spec'

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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof VariantTerm))
      return new TypeError('target term must be VariantTerm')

    const { sumType, tag, bodyTerm } = this

    const err = sumType.typeCheck(targetTerm.sumType)
    if(err) return err

    if(tag !== targetTerm.tag)
      return new TypeError('target term have different variant tag')

    return bodyTerm.termCheck(targetTerm.bodyTerm)
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

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    const { sumType, tag, bodyTerm } = this

    const compiledSumType = sumType.compileType()
    const bodyClosure = bodyTerm.compileClosure(closureSpecs)

    return closureArgs => {
      const value = bodyClosure(closureArgs)
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
    const { tag, bodyTerm } = this

    const bodyRep = bodyTerm.formatTerm()

    return ['variant', tag, bodyRep]
  }
}

import {
  assertString,
  assertNoError,
  assertFunction,
  assertInstanceOf,
  assertListContent,
} from '../core/assert'

import { SumType } from '../type/sum'

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

  *subTerms() {
    yield this.bodyTerm
  }

  *subTypes() {
    yield this.sumType
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { sumType, tag, bodyTerm } = this

    const newSumType = typeMapper(sumType)
    const newBodyTerm = termMapper(bodyTerm)

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
    return this.map(
      subTerm => subTerm.evaluate(),
      subType => subType)
  }

  formatTerm() {
    const { tag, bodyTerm } = this

    const bodyRep = bodyTerm.formatTerm()

    return ['variant', tag, bodyRep]
  }
}

export const variant = (sumType, tag, bodyTerm) => {
  return new VariantTerm(sumType, tag, bodyTerm)
}

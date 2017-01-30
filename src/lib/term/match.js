import { IMap } from '../core/container'

import { Type } from '../type/type'
import { SumType } from '../type/sum'
import { ArrowType } from '../type/arrow'

import { Term } from './term'
import { ArgSpec } from './arg-spec'
import { VariantTerm } from './variant'
import { VariableTerm } from './variable'
import { ValueLambdaTerm } from './lambda'

import {
  assertMap, assertInstanceOf,
  assertListContent, assertNoError
} from '../core/assert'

const $variantTerm = Symbol('@variantTerm')
const $caseTerms = Symbol('@caseTerms')
const $returnType = Symbol('@returnType')

export class MatchTerm extends Term {
  constructor(variantTerm, returnType, caseTerms) {
    assertInstanceOf(variantTerm, Term)
    assertInstanceOf(returnType, Type)
    assertMap(caseTerms)

    const sumType = variantTerm.termType()
    assertInstanceOf(sumType, SumType)

    const { typeMap } = sumType
    if(typeMap.size !== caseTerms.size)
      throw new TypeError('case terms must match all sum types')

    for(const [tag, caseType] of typeMap.entries()) {
      const caseTerm = caseTerms.get(tag)
      if(!caseTerm) {
        throw new TypeError('case terms must match all sum types')
      }

      assertInstanceOf(caseTerm, ValueLambdaTerm)

      const termType = caseTerm.termType()
      assertInstanceOf(termType, ArrowType)

      assertNoError(caseType.typeCheck(termType.leftType))
      assertNoError(returnType.typeCheck(termType.rightType))
    }

    super()

    this[$variantTerm] = variantTerm
    this[$returnType] = returnType
    this[$caseTerms] = caseTerms
  }

  get variantTerm() {
    return this[$variantTerm]
  }

  get caseTerms() {
    return this[$caseTerms]
  }

  get returnType() {
    return this[$returnType]
  }

  termType() {
    return this.returnType
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof MatchTerm))
      return new TypeError('target term must be MatchTerm')

    const { variantTerm, caseTerms } = this
    const targetCases = targetTerm.caseTerms

    const err = variantTerm.termCheck(targetTerm.variantTerm)
    if(err) return err

    for(const [tag, term] of caseTerms.entries()) {
      const err = term.termCheck(targetCases.get(tag))
      if(err) return err
    }
  }

  *subTerms() {
    const { variantTerm, caseTerms } = this
    yield variantTerm
    yield* caseTerms.values()
  }

  *subTypes() {
    yield this.returnType
  }

  map(termMapper, typeMapper) {
    const { variantTerm, caseTerms, returnType } = this

    let termModified = false

    const newVariantTerm = termMapper(variantTerm)

    if(newVariantTerm !== variantTerm)
      termModified = true

    const newCaseTerms = caseTerms.map(term => {
      const newTerm = termMapper(term)

      if(newTerm !== term)
        termModified = true

      return newTerm
    })

    const newReturnType = typeMapper(returnType)
    if(newReturnType !== returnType)
      termModified = true

    if(termModified) {
      return new MatchTerm(newVariantTerm, newReturnType, newCaseTerms)

    } else {
      return this
    }
  }

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    const { variantTerm, caseTerms } = this

    const variantClosure = variantTerm.compileClosure(closureSpecs)

    const caseClosures = caseTerms.map(
      lambdaTerm => {
        const { argType } = lambdaTerm
        const argVar = Symbol('_')
        const argSpec = new ArgSpec(
          argVar, argType.compileType())

        const bodyTerm = lambdaTerm.applyTerm(
          new VariableTerm(argVar, argType))

        const inClosureSpecs = closureSpecs.push(argSpec)
        return bodyTerm.compileClosure(inClosureSpecs)
      })

    return closureArgs => {
      const variant = variantClosure(closureArgs)

      const { tag, value } = variant
      const caseClosure = caseClosures.get(tag)

      if(!caseClosure) {
        throw new Error('variant value contains unexpected tag')
      }

      const inClosureArgs = [...closureArgs, value]

      return caseClosure(inClosureArgs)
    }
  }

  evaluate() {
    const { variantTerm, caseTerms } = this

    if(!(variantTerm instanceof VariantTerm))
      return this

    const { tag, bodyTerm } = variantTerm
    const caseTerm = caseTerms.get(tag)

    assertInstanceOf(caseTerm, ValueLambdaTerm)

    return caseTerm
      .applyTerm(bodyTerm)
      .evaluate()
  }

  formatTerm() {
    const { variantTerm, caseTerms } = this

    const sumRep = variantTerm.formatTerm()
    const caseReps = caseTerms.map(term => term.formatTerm())

    return ['match', sumRep, [...caseReps]]
  }
}

export const match = (variantTerm, returnType, ...caseTerms) =>
  new MatchTerm(variantTerm, returnType, IMap(caseTerms))

export const when = (sumType, tag, argVar, bodyTerm) => {
  assertInstanceOf(sumType, SumType)

  const tagType = sumType.getTagType(tag)

  return [tag, new ValueLambdaTerm(argVar, tagType, bodyTerm)]
}

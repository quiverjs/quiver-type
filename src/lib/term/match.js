import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { ArgSpec } from '../compiled-term/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { SumType } from '../type/sum'
import { ArrowType } from '../type/arrow'

import { Kind } from '../kind/kind'

import { Term } from './term'
import { VariantTerm } from './variant'
import { TermLambdaTerm } from './term-lambda'

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

    for(const [tag, caseType] of typeMap) {
      const caseTerm = caseTerms.get(tag)
      if(!caseTerm) {
        throw new TypeError('case terms must match all sum types')
      }

      assertInstanceOf(caseTerm, TermLambdaTerm)

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

  freeTermVariables() {
    const { variantTerm, caseTerms } = this

    return caseTerms::unionMap(
      term => term.freeTermVariables())
      .union(variantTerm.freeTermVariables())
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

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { variantTerm, caseTerms } = this

    for(const term of caseTerms.values()) {
      const err = term.validateVarType(termVar, type)
      if(err) return err
    }

    return variantTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { variantTerm, caseTerms, returnType } = this

    for(const term of caseTerms.values()) {
      const err = term.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    const err = variantTerm.validateTVarKind(typeVar, kind)
    if(err) return err

    return returnType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { variantTerm, caseTerms, returnType } = this

    const [newCaseTerms, termModified] = caseTerms::mapUnique(
      caseTerm => caseTerm.bindTerm(termVar, term))

    const newvariantTerm = variantTerm.bindTerm(termVar, term)

    if(termModified || newvariantTerm !== variantTerm) {
      return new MatchTerm(newvariantTerm, returnType, newCaseTerms)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { variantTerm, caseTerms, returnType } = this

    let termModified = false

    const newvariantTerm = variantTerm.bindType(typeVar, type)

    if(newvariantTerm !== variantTerm)
      termModified = true

    const newCaseTerms = caseTerms.map(term => {
      const newTerm = term.bindType(typeVar, type)

      if(newTerm !== term)
        termModified = true

      return newTerm
    })

    const newReturnType = returnType.bindType(typeVar, type)
    if(newReturnType !== returnType)
      termModified = true

    if(termModified) {
      return new MatchTerm(newvariantTerm, newReturnType, newCaseTerms)

    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { variantTerm, caseTerms } = this

    const compiledVariant = variantTerm.compileBody(argSpecs)

    const compiledCases = caseTerms.map(term =>
      term.compileBody(argSpecs))

    return (...args) => {
      const variant = compiledVariant(...args)

      const { tag, value } = variant
      const compiledCase = compiledCases.get(tag)

      if(!compiledCase) {
        throw new Error('variant value contains unexpected tag')
      }

      return compiledCase(...args).call(value)
    }
  }

  evaluate() {
    const { variantTerm, caseTerms } = this

    if(!(variantTerm instanceof VariantTerm))
      return this

    const { tag, bodyTerm } = variantTerm
    const caseTerm = caseTerms.get(tag)

    assertInstanceOf(caseTerm, TermLambdaTerm)

    return caseTerm.applyTerm(bodyTerm)
  }

  formatTerm() {
    const { variantTerm, caseTerms } = this

    const sumRep = variantTerm.formatTerm()
    const caseReps = caseTerms.map(term => term.formatTerm())

    return ['match', sumRep, [...caseReps]]
  }
}

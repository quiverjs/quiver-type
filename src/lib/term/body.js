import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { ArgSpec } from '../compiled-term/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'

import {
  assertListContent, assertInstanceOf, assertFunction
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { Term } from './term'

const $argTerms = Symbol('@argTerms')
const $returnType = Symbol('@returnType')
const $compiler = Symbol('@compiler')

export class BodyTerm extends Term {
  // Compiler :: Function (IList Type -> Function)
  // constructor :: IList Term -> Type -> Compiler -> ()
  constructor(argTerms, returnType, compiler) {
    assertListContent(argTerms, Term)

    assertInstanceOf(returnType, Type)
    assertFunction(compiler)

    super()

    this[$argTerms] = argTerms
    this[$returnType] = returnType
    this[$compiler] = compiler
  }

  get argTerms() {
    return this[$argTerms]
  }

  get returnType() {
    return this[$returnType]
  }

  get compiler() {
    return this[$compiler]
  }

  freeTermVariables() {
    return this.argTerms::unionMap(
      argTerm => argTerm.freeTermVariables())
  }

  termType() {
    return this.returnType
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    for(const term of this.argTerms) {
      const err = term.validateVarType(termVar, type)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    for(const term of this.argTerms) {
      const err = term.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { argTerms, returnType, compiler } = this

    const [newArgTerms, termModified] = argTerms::mapUnique(
      argTerm => argTerm.bindTerm(termVar, term))

    if(termModified) {
      return new BodyTerm(newArgTerms, returnType, compiler)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { argTerms, returnType, compiler } = this

    const [newArgTerms, termModified] = argTerms::mapUnique(
      argTerm => argTerm.bindType(typeVar, type))

    const newReturnType = returnType.bindType(typeVar, type)

    if(termModified || newReturnType !== returnType) {
      return new BodyTerm(newArgTerms, newReturnType, compiler)
    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { argTerms, compiler } = this

    const argExtractors = argTerms.map(
      term => term.compileBody(argSpecs))

    const argCompiledTypes = argTerms.map(
      term => term.termType().compileType())

    const compiledBody = compiler(...argCompiledTypes)
    assertInstanceOf(compiledBody, Function)

    return (...args) => {
      const inArgs = argExtractors.map(
        extractArgs => extractArgs(...args))

      return compiledBody(...inArgs)
    }
  }

  evaluate() {
    return this
  }

  formatTerm() {
    const { argTerms, returnType } = this

    const argTermsRep = [...argTerms.map(term => term.formatTerm())]
    const returnTypeRep = returnType.formatType()

    return ['body-compiler', argTermsRep, returnTypeRep]
  }
}

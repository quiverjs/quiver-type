import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { ArgSpec } from '../compiled-term/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'

import {
  assertListContent, assertType, assertFunction
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { Term } from './term'

const $argTerms = Symbol('@argTerms')
const $returnType = Symbol('@returnType')
const $compiler = Symbol('@compiler')

export class BodyTerm extends Term {
  // Compiler :: Function (List Type -> Function)
  // constructor :: List Term -> Type -> Compiler -> ()
  constructor(argTerms, returnType, compiler) {
    assertListContent(argTerms, Term)

    assertType(returnType, Type)
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
    assertType(termVar, TermVariable)
    assertType(type, Type)

    for(const term of this.argTerms) {
      const err = term.validateVarType(termVar, type)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    for(const term of this.argTerms) {
      const err = term.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindTerm(termVar, term) {
    assertType(termVar, TermVariable)
    assertType(term, Term)

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
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

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
    assertType(compiledBody, Function)

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

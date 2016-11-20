import { ArgSpec } from '../../compiled-term/arg-spec'

import {
  assertListContent, assertInstanceOf, assertFunction
} from '../../core/assert'

import { CommonBodyTerm, $newInstance } from './common'

const $compiler = Symbol('@compiler')

export class BodyTerm extends CommonBodyTerm {
  // Compiler :: Function (IList Type -> Function)
  // constructor :: IList Term -> Type -> Compiler -> ()
  constructor(argTerms, returnType, compiler) {
    assertFunction(compiler)

    super(argTerms, returnType)

    this[$compiler] = compiler
  }

  get compiler() {
    return this[$compiler]
  }

  [$newInstance](argTerms, returnType) {
    return new BodyTerm(argTerms, returnType, this.compiler)
  }

  termCheck(targetTerm) {
    const err = super.termCheck(targetTerm)
    if(err) return err

    if(!(targetTerm instanceof BodyTerm))
      return new TypeError('target term must be BodyTerm')

    const { compiler } = this

    if(compiler !== targetTerm.compiler)
      return new TypeError('target term have different compiler')

    return null
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

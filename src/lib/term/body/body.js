import { ArgSpec } from '../arg-spec'

import {
  assertListContent, assertInstanceOf, assertFunction
} from '../../core/assert'

import { IList } from '../../core/container'

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

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    const { argTerms, compiler } = this

    const argExtractors = argTerms.map(
      term => term.compileClosure(closureSpecs))

    const argCompiledTypes = argTerms.map(
      term => term.termType().compileType())

    const bodyClosure = compiler(...argCompiledTypes)
    assertInstanceOf(bodyClosure, Function)

    return closureArgs => {
      const inClosureArgs = argExtractors.map(
        extractArgs => extractArgs(closureArgs))

      return bodyClosure(...inClosureArgs)
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

export const body = (argTerms, returnType, compiler) => {
  return new BodyTerm(IList(argTerms), returnType, compiler)
}

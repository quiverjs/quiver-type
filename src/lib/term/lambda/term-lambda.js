import { Term } from '../term'
import { ArgSpec } from '../arg-spec'

import {
  assertInstanceOf, assertListContent, assertNoError
} from '../../core/assert'

import { LambdaTerm } from './common'

export class TermLambdaTerm extends LambdaTerm {
  evaluate() {
    return this
  }

  compileClosure(closureArgs) {
    assertListContent(closureArgs, ArgSpec)

    throw new Error('term lambda cannot be compiled')
  }

  applyTerm(term) {
    assertInstanceOf(term, Term)

    const { argVar, argType, bodyTerm } = this
    assertNoError(argType.typeCheck(term.termType()))

    return bodyTerm.bindTerm(argVar, term).evaluate()
  }

  formatTerm() {
    const { argVar, argType, bodyTerm } = this

    const varRep = argVar.name
    const argTypeRep = argType.formatType()
    const bodyRep = bodyTerm.formatTerm()

    return ['term-lambda', [varRep, argTypeRep], bodyRep]
  }
}

export const termLambda = (argTerms, bodyTerm) => {
  return argTerms.reduceRight(
    (bodyTerm, [argTerm, argType]) => {
      return new TermLambdaTerm(argTerm, argType, bodyTerm)
    },
    bodyTerm)
}

import {
  isInstanceOf,
  assertNoError,
  assertFunction,
  assertInstanceOf
} from '../../core/assert'

import { ConstraintType } from '../../type/constraint'

import { Term } from '../term'

const $constraintType = Symbol('@constraintType')
const $concreteTerm = Symbol('@concreteTerm')

export class ProofTerm extends Term {
  constructor(constraintType, concreteTerm) {
    assertInstanceOf(constraintType, ConstraintType)

    const { specType } = constraintType
    const concreteType = concreteTerm.termType()
    assertNoError(specType.typeCheck(concreteType))

    super()

    this[$constraintType] = constraintType
    this[$concreteTerm] = concreteTerm
  }

  get constraintType() {
    return this[$constraintType]
  }

  get concreteTerm() {
    return this[$concreteTerm]
  }

  termType() {
    return this.constraintType
  }

  *subTerms() {
    yield this.concreteTerm
  }

  *subTypes() {
    yield this.constraintType
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { constraintType, concreteTerm } = this

    const newConstraintType = typeMapper(constraintType)
    const newConcreteTerm = termMapper(concreteTerm)

    if(newConstraintType !== constraintType || newConcreteTerm !== concreteTerm) {
      return new ProofTerm(newConstraintType, newConcreteTerm)

    } else {
      return this
    }
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) {
      return null
    }

    if(!isInstanceOf(targetTerm, ProofTerm)) {
      return new TypeError('target term must be ProofTerm')
    }

    const { constraintType, concreteTerm } = this

    const err = constraintType.typeCheck(targetTerm.constraintType)
    if(err) return err

    return concreteTerm.termCheck(targetTerm.concreteTerm)
  }

  evaluate() {
    return this
  }

  compileClosure(closureArgs) {
    throw new Error('ProofTerm cannot be compiled')
  }

  formatTerm() {
    const { constraintType, concreteTerm } = this

    const constraintRep = constraintType.formatType()
    const concreteRep = concreteTerm.formatTerm()

    return ['proof', constraintRep, concreteRep]
  }
}

export const proof = (constraintType, concreteTerm) => {
  return new ProofTerm(constraintType, concreteTerm)
}

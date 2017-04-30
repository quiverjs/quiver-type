import {
  isInstanceOf,
  assertInstanceOf
} from '../../core/assert'

import { Term } from '../term'
import { ConstraintType } from '../../type/constraint'

import { ProofTerm } from './proof'

const $constraintTerm = Symbol('@constraintTerm')
const $specType = Symbol('@specType')

export class DeconstraintTerm extends Term {
  constructor(constraintTerm) {
    assertInstanceOf(constraintTerm, Term)

    const constraintType = constraintTerm.termType()
    assertInstanceOf(constraintType, ConstraintType)

    const specType = constraintType.specType

    super()

    this[$constraintTerm] = constraintTerm
    this[$specType] = specType
  }

  get constraintTerm() {
    return this[$constraintTerm]
  }

  get specType() {
    return this[$specType]
  }

  termType() {
    return this.specType
  }

  *subTerms() {
    yield this.constraintTerm
  }

  *subTypes() {
    // empty
  }

  map(termMapper, typeMapper) {
    const { constraintTerm } = this

    const newConstraintTerm = termMapper(constraintTerm)

    if(newConstraintTerm !== constraintTerm) {
      return new DeconstraintTerm(newConstraintTerm)
    } else {
      return this
    }
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(!isInstanceOf(targetTerm, DeconstraintTerm)) {
      return new TypeError('target term is not DeconstraintTerm')
    }

    const { constraintTerm } = this
    return constraintTerm.termCheck(targetTerm.constraintTerm)
  }

  compileClosure(closureArgs) {
    throw new Error('deconstraint term cannot be compiled')
  }

  evaluate() {
    const { constraintTerm } = this

    const newConstraintTerm = constraintTerm.evaluate()

    if(isInstanceOf(newConstraintTerm, ProofTerm)) {
      return newConstraintTerm.concreteTerm

    } else if(newConstraintTerm !== constraintTerm) {
      return new DeconstraintTerm(newConstraintTerm)

    } else {
      return this
    }
  }

  formatTerm() {
    const { constraintTerm } = this

    const constraintRep = constraintTerm.formatTerm()

    return ['deconstraint', constraintRep]
  }
}

export const deconstraint = (constraintTerm) => {
  return new DeconstraintTerm(constraintTerm)
}

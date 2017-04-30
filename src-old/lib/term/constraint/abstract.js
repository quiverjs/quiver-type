import {
  isInstanceOf,
  assertFunction,
  assertInstanceOf
} from '../../core/assert'

import { ISet } from '../../core/container'

import { ConstraintType } from '../../type/constraint'

import { Term } from '../term'

const $constraintType = Symbol('@constraintType')

export class AbstractTerm extends Term {
  constructor(constraintType) {
    assertInstanceOf(constraintType, ConstraintType)

    super()

    this[$constraintType] = constraintType
  }

  get constraintType() {
    return this[$constraintType]
  }

  termType() {
    return this.constraintType
  }

  *subTerms() {
    // empty
  }

  *subTypes() {
    yield this.constraintType
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { constraintType } = this

    const newConstraintType = typeMapper(constraintType)

    if(newConstraintType !== constraintType) {
      return new AbstractTerm(newConstraintType)

    } else {
      return this
    }
  }

  freeConstraints() {
    const { constraintType } = this

    return ISet([constraintType])
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) {
      return null
    }

    if(!isInstanceOf(targetTerm, AbstractTerm)) {
      return new TypeError('target term must be AbstractTerm')
    }

    const { constraintType } = this

    return constraintType.typeCheck(targetTerm.constraintType)
  }

  bindConstraint(constraintTerm) {
    assertInstanceOf(constraintTerm, Term)

    const targetConstraintType = constraintTerm.termType()

    assertInstanceOf(targetConstraintType, ConstraintType,
      'type of constraint term must be constraint type')

    const { constraintType } = this

    const err = constraintType.typeCheck(targetConstraintType)
    if(err) return this

    return constraintTerm
  }

  evaluate() {
    return this
  }

  compileClosure(closureArgs) {
    throw new Error('AbstractTerm cannot be compiled')
  }

  formatTerm() {
    const { constraintType } = this

    const constraintRep = constraintType.formatType()

    return ['abstract', constraintRep]
  }
}

export const abstract = constraintType => {
  return new AbstractTerm(constraintType)
}

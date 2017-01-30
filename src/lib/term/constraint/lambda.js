import {
  assertArray,
  isInstanceOf,
  assertNoError,
  assertFunction,
  assertInstanceOf
} from '../../core/assert'

import { ArrowType } from '../../type/arrow'
import { ConstraintType } from '../../type/constraint'

import { Term } from '../term'

const $constraintType = Symbol('@constraintType')
const $bodyTerm = Symbol('@bodyTerm')
const $selfType = Symbol('@selfType')

export class ConstraintLambdaTerm extends Term {
  constructor(constraintType, bodyTerm) {
    assertInstanceOf(constraintType, ConstraintType)
    assertInstanceOf(bodyTerm, Term)

    const bodyType = bodyTerm.termType()
    const selfType = new ArrowType(constraintType, bodyType)

    super()

    this[$constraintType] = constraintType
    this[$bodyTerm] = bodyTerm
    this[$selfType] = selfType
  }

  get constraintType() {
    return this[$constraintType]
  }

  get bodyTerm() {
    return this[$bodyTerm]
  }

  termType() {
    return this[$selfType]
  }

  *subTerms() {
    yield this.bodyTerm
  }

  *subTypes() {
    yield this.constraintType
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { constraintType, bodyTerm } = this

    const newConstraintType = typeMapper(constraintType)
    const newBodyTerm = termMapper(bodyTerm)

    if(newConstraintType !== constraintType || newBodyTerm !== bodyTerm) {
      return new ConstraintLambdaTerm(newConstraintType, newBodyTerm)

    } else {
      return this
    }
  }

  freeConstraints() {
    const { constraintType, bodyTerm } = this

    const bodyConstraints = bodyTerm.freeConstraints()

    return bodyConstraints.filter(
      bodyConstraint => {
        // return true if body constraint is different
        // from abstracted constraint, i.e. err is not null
        return constraintType.typeCheck(bodyConstraint)
      })
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) {
      return null
    }

    if(!isInstanceOf(targetTerm, ConstraintLambdaTerm)) {
      return new TypeError('target term must be ConstraintLambdaTerm')
    }

    const { constraintType, bodyTerm } = this

    const err = constraintType.typeCheck(targetTerm.constraintTerm)
    if(err) return err

    return bodyTerm.termCheck(targetTerm.bodyTerm)
  }

  evaluate() {
    return this
  }

  applyTerm(constraintTerm) {
    assertInstanceOf(constraintTerm, Term)

    const { constraintType, bodyTerm } = this
    assertNoError(constraintType.typeCheck(constraintTerm.termType()))

    return bodyTerm.bindConstraint(constraintTerm)
  }

  compileClosure(closureArgs) {
    throw new Error('constraint lambda cannot be compiled')
  }

  formatTerm() {
    const { constraintType, bodyTerm } = this

    const constraintRep = constraintType.formatType()
    const bodyRep = bodyTerm.formatTerm()

    return ['constraint-lambda', constraintRep, bodyRep]
  }
}

export const constraintLambda = (constraints, bodyTerm) => {
  assertArray(constraints)

  return constraints.reduceRight(
    (bodyTerm, constraintType) => {
      return new ConstraintLambdaTerm(constraintType, bodyTerm)
    },
    bodyTerm)
}

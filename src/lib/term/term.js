import { formatLisp } from '../core/util'
import { unionMap } from '../core/container'
import {
  assertKeyword,
  assertInstanceOf
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'
import { ConstraintKind } from '../kind/constraint'

export class Term {
  constructor() {
    if(this.constructor === Term)
      throw new Error('Abstract class Term cannot be instantiated')
  }

  subTerms() {
    throw new Error('not implemented')
  }

  subTypes() {
    throw new Error('not implemented')
  }

  map(termMapper, typeMapper) {
    throw new Error('not implemented')
  }

  freeTermVariables() {
    return this.subTerms()::unionMap(
      subTerm => subTerm.freeTermVariables())
  }

  freeConstraints() {
    return this.subTerms()::unionMap(
      subTerm => subTerm.freeConstraints())
  }

  // termType :: () -> Type
  // Get the type of the term for type checking
  termType() {
    throw new Error('not implemented')
  }

  // termCheck :: Term -> Maybe Error
  termCheck(targetTerm) {
    throw new Error('not implemented')
  }

  validateVarType(termVar, type) {
    assertKeyword(termVar)
    assertInstanceOf(type, Type)

    for(const subTerm of this.subTerms()) {
      const err = subTerm.validateVarType(termVar, type)
      if(err) return err
    }
  }

  validateTVarKind(typeVar, kind) {
    assertKeyword(typeVar)
    assertInstanceOf(kind, Kind)

    for (const subTerm of this.subTerms()) {
      const err = subTerm.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    for (const subType of this.subTypes()) {
      const err = subType.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindTerm(termVar, term) {
    assertKeyword(termVar)
    assertInstanceOf(term, Term)

    return this.map(
      subTerm => subTerm.bindTerm(termVar, term),
      subType => subType)
  }

  bindType(typeVar, type) {
    assertKeyword(typeVar)
    assertInstanceOf(type, Type)

    return this.map(
      subTerm => subTerm.bindType(typeVar, type),
      subType => subType.bindType(typeVar, type))
  }

  bindConstraint(constraint) {
    assertInstanceOf(constraint, Term)
    assertInstanceOf(constraint.termType().typeKind(), ConstraintKind,
      'kind of constraint term must be constraint kind')

    return this.map(
      subTerm => subTerm.bindConstraint(constraint),
      subType => subType)
  }

  // evaluate :: () -> Term
  // Eagerly reduce the term into simpler forms
  evaluate() {
    throw new Error('not implemented')
  }

  // compileClosure :: IList ArgSpec -> Closure
  compileClosure(closureArgs) {
    throw new Error('not implemented')
  }

  // formatTerm :: () -> IList Object
  formatTerm() {
    throw new Error('not impemented')
  }

  inspect() {
    return formatLisp(this.formatTerm())
  }
}

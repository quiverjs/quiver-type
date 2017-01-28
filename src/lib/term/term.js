import { formatLisp } from '../core/util'
import { assertInstanceOf } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

export class Term {
  constructor() {
    if(this.constructor === Term)
      throw new Error('Abstract class Term cannot be instantiated')
  }

  // freeTermVariables :: () -> ISet TermVariable
  // Unbound term variables in the term
  freeTermVariables() {
    throw new Error('not implemented')
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

  subTerms() {
    throw new Error('not implemented')
  }

  subTypes() {
    throw new Error('not implemented')
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    for(const subTerm of this.subTerms()) {
      const err = subTerm.validateVarType(termVar, type)
      if(err) return err
    }
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
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

  map(termMapper, typeMapper) {
    throw new Error('not implemented')
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    return this.map(
      subTerm => subTerm.bindTerm(termVar, term),
      subType => subType)
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    return this.map(
      subTerm => subTerm.bindType(typeVar, type),
      subType => subType.bindType(typeVar, type))
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

import { formatLisp } from '../core/util'

export class Term {
  constructor() {
    if(this.constructor === Term)
      throw new Error('Abstract class Term cannot be instantiated')
  }

  // freeTermVariables :: () -> Set TermVariable
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

  // validateVarType :: TermVariable -> Type -> Maybe Error
  validateVarType(termVar, type) {
    throw new Error('not implemented')
  }

  // validateTVarKind :: TypeVariable -> Kind -> MaybeError
  validateTVarKind(typeVar, kind) {
    throw new Error('not implemented')
  }

  // bindTermVariable :: TermVariable -> Term -> Term
  // Bind unbound term variable to new term
  bindTerm(termVar, term) {
    throw new Error('not implemented')
  }

  // bindTypeVariable :: TypeVariable -> Type -> Term
  // Bind unbound type variable to new type
  bindType(typeVar, type) {
    throw new Error('not implemented')
  }

  // evaluate :: () -> Term
  // Eagerly reduce the term into simpler forms
  evaluate() {
    throw new Error('not implemented')
  }

  // compileBody :: List ArgSpec -> Function
  compileBody(argSpecs) {
    throw new Error('not implemented')
  }

  // formatTerm :: () -> List Object
  formatTerm() {
    throw new Error('not impemented')
  }

  inspect() {
    return formatLisp(this.formatTerm())
  }
}

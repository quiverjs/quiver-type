import { formatLisp } from '../core/util'

export class Expression {
  constructor() {
    if(this.constructor === Expression)
      throw new Error('Abstract class Expression cannot be instantiated')
  }

  // freeTermVariables :: () -> Set TermVariable
  // Unbound term variables in the expression
  freeTermVariables() {
    throw new Error('not implemented')
  }

  // exprType :: () -> Type
  // Get the type of the expression for type checking
  exprType() {
    throw new Error('not implemented')
  }

  // exprCheck :: Expression -> Maybe Error
  exprCheck(targetExpr) {
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

  // bindTermVariable :: TermVariable -> Expression -> Expression
  // Bind unbound term variable to new expression
  bindTerm(termVar, expr) {
    throw new Error('not implemented')
  }

  // bindTypeVariable :: TypeVariable -> Type -> Expression
  // Bind unbound type variable to new type
  bindType(typeVar, type) {
    throw new Error('not implemented')
  }

  // evaluate :: () -> Expression
  // Eagerly reduce the expression into simpler forms
  evaluate() {
    throw new Error('not implemented')
  }

  // compileBody :: List ArgSpec -> Function
  compileBody(argSpecs) {
    throw new Error('not implemented')
  }

  // formatExpr :: () -> List Object
  formatExpr() {
    throw new Error('not impemented')
  }

  inspect() {
    return formatLisp(this.formatExpr())
  }
}

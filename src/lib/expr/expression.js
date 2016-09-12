
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

  // exprType :: Map TermVariable Type -> Type
  // Get the type of the expression for type checking
  exprType(env) {
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

  // isTerminal :: () -> Bool
  // Used to signal that the expression is terminal
  // so that lambda application can proceed with call by value
  isTerminal() {
    throw new Error('not implemented')
  }
}

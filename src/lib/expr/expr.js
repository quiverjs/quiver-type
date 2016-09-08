
export class Expression {
  constructor() {
    if(this.constructor === Expression)
      throw new Error('Abstract class Expression cannot be instantiated')
  }

  // isTerminal :: () -> Bool
  isTerminal() {
    throw new Error('not implemented')
  }

  // freeTermVariables :: () -> Set TermVariable
  freeTermVariables() {
    throw new Error('not implemented')
  }

  // freeTypeVariables :: () -> Set TypeVariable
  freeTypeVariables() {
    throw new Error('not implemented')
  }

  // getType :: TypeEnv -> Type
  getType(env) {
    throw new Error('not implemented')
  }

  // bindTermVariable :: TermVariable -> Expression -> Expression
  bindTerm(termVar, expr) {
    throw new Error('not implemented')
  }

  // bindTypeVariable :: TypeVariable -> Type -> Expression
  bindType(typeVar, type) {
    throw new Error('not implemented')
  }

  // reduce :: () -> Expression
  reduce() {
    throw new Error('not implemented')
  }
}

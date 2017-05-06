
export class Term {
  constructor() {
    if(this.constructor === Term)
      throw new Error('Abstract class Term cannot be instantiated')
  }

  // termType :: This -> Type
  termType() {
    throw new Error('not implemented')
  }

  // freeTermVariables :: This -> Set Variable
  freeTermVariables() {
    throw new Error('not implemented')
  }

  // validateVarType :: This -> VariableTerm -> Maybe Error
  validateVarType(typeVar, type) {
    throw new Error('not implemented')
  }

  // bindTerm :: This -> Variable -> Term -> Term
  bindTerm(termVar, term) {
    throw new Error('not implemented')
  }

  // weakHeadNormalForm :: This -> Term
  weakHeadNormalForm() {
    throw new Error('not implemented')
  }

  // normalForm :: This -> Term
  normalForm() {
    throw new Error('not implemented')
  }

  // compileClosure :: This -> Node Variable -> Closure
  compileClosure(argVars) {
    throw new Error('not implemented')
  }
}

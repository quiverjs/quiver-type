
export class Term {
  constructor() {
    if(this.constructor === Term)
      throw new Error('Abstract class Term cannot be instantiated')
  }

  // freeTermVariables :: This -> Set Variable
  freeTermVariables() {
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

  // compileClosure :: This -> IList Variable -> (List Any ->  Any)
  compileClosure(argVars) {
    throw new Error('not implemented')
  }
}

import { formatLisp } from '../../format'
import { assertTerm } from '../term/term'
import { isInstanceOf, assertInstanceOf } from '../../assert'

export class Type {
  constructor() {
    if(this.constructor === Type)
      throw new Error('abstract class Type cannot be instantiated')
  }

  // Other than arrow type, all other types
  // have arity of 0
  // arity :: This -> Nat
  get arity() {
    return 0
  }

  // The real type used for type comparison
  // This is usually same as this
  get realType() {
    return this
  }

  checkTerm(term) {
    assertTerm(term)
    return this.checkType(term.termType())
  }

  // checkType :: This -> Type -> Maybe Error
  checkType(type) {
    throw new Error('Not implemented')
  }

  // checkValue :: This -> Any -> Maybe Error
  checkValue(value) {
    throw new Error('Not implemented')
  }

  // formatType :: This -> Array
  formatType() {
    throw new Error('Not implemented')
  }

  inspect() {
    return formatLisp(this.formatType())
  }
}

export const isType = type =>
  isInstanceOf(type, Type)

export const assertType = type =>
  assertInstanceOf(type, Type)

import { Type, assertType } from './type'

const $implType = Symbol('@implType')

export class AbstractType extends Type {
  constructor() {
    super()

    this[$implType] = null
  }

  get implType() {
    return this[$implType]
  }

  get realType() {
    const { implType } = this

    if(!implType)
      throw new Error('abstract type is not yet implemented')

    return implType
  }

  implement(type) {
    assertType(type)

    if(this.implType)
      throw new Error('abstract type is already implemented')

    this[$implType] = type
  }

  get arity() {
    return this.realType.arity
  }

  checkTerm(term) {
    return this.realType.checkTerm(term)
  }

  checkType(type) {
    return this.realType.checkType(type)
  }

  checkValue(value) {
    return this.realType.checkValue(value)
  }

  formatType() {
    return ['abstract-type']
  }
}

export const recursiveType = constructor => {
  const abstractType = new AbstractType()
  const realType = constructor(abstractType)
  abstract.implement(realType)
  return realType
}

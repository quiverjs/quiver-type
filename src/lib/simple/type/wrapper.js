import { Type } from './type'

export class WrapperType extends Type {
  checkTerm(term) {
    return this.realType.checkTerm(term)
  }

  checkType(type) {
    return this.realType.checkType(type)
  }

  checkValue(value) {
    return this.realType.checkValue(value)
  }
}

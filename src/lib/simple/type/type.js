import { formatLisp } from '../common/format'

export class Type {
  constructor() {
    if(this.constructor === Type)
      throw new Error('abstract class Type cannot be instantiated')
  }

  // checkType :: This -> Type -> Maybe Error
  checkType(type) {
    throw new Error('Not implemented')
  }

  // checkValue :: This -> Any -> Maybe Error
  checkValue(value) {
    throw new Error('Not implemented')
  }

  formatType() {
    throw new Error('Not implemented')
  }

  inspect() {
    return formatLisp(this.formatType())
  }
}

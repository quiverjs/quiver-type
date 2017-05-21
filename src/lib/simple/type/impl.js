import { assertType } from './type'

export const typeImpl = ParentType =>
  class extends ParentType {
    checkType(targetType) {
      assertType(targetType)
      return super.checkType(targetType)
    }
  }

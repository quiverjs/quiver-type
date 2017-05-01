import { Type } from './type'
import { typeImpl } from './impl'
import { assertString, assertFunction, isInstanceOf } from '../common/assert'

const $name = Symbol('@name')
const $valueChecker = Symbol('@valueChecker')

export const PrimitiveType = typeImpl(
  class extends Type {
    constructor(name, valueChecker) {
      assertString(name)
      assertFunction(valueChecker)

      super()

      this[$name] = name
      this[$valueChecker] = valueChecker
    }

    get typeName() {
      return this[$name]
    }

    get valueChecker() {
      return this[$valueChecker]
    }

    checkType(targetType) {
      if(!isInstanceOf(targetType, PrimitiveType))
        return new TypeError('target type must be primitive type')

      const { typeName, valueChecker } = this

      if(typeName !== targetType.typeName)
        return new TypeError('target primitive type have different name')

      if(valueChecker !== targetType.valueChecker)
        return new TypeError('target primitive type have different value checker function')

      return null
    }

    checkValue(value) {
      const { valueChecker } = this
      return valueChecker(value)
    }
  })

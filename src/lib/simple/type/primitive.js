import { Type } from './type'
import {
  assertString, assertFunction, isInstanceOf
} from '../../assert'

const $typeName = Symbol('@typeName')
const $valueChecker = Symbol('@valueChecker')

export class PrimitiveType extends Type {
  constructor(typeName, valueChecker) {
    assertString(typeName)
    assertFunction(valueChecker)

    super()

    this[$typeName] = typeName
    this[$valueChecker] = valueChecker
  }

  get typeName() {
    return this[$typeName]
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

  formatType() {
    const { typeName } = this
    return ['primitive-type', typeName]
  }
}

export const primitiveType = (name, valueChecker) =>
  new PrimitiveType(name, valueChecker)

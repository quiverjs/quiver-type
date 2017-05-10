import { typeImpl } from './impl'
import { Type, assertType } from './type'
import { assertList, zipIter } from '../common/container'
import {
  assertString, assertFunction, isInstanceOf
} from '../common/assert'

const $name = Symbol('@name')
const $subTypes = Symbol('@subType')
const $valueChecker = Symbol('@valueChecker')

export const CompositeType = typeImpl(
  class extends Type {
    // type ValueChecker = List Type -> Any -> Bool
    // constructor :: This -> String -> List Type -> ValueChecker -> ()
    constructor(name, subTypes, valueChecker) {
      assertString(name)
      assertList(subTypes)
      assertFunction(valueChecker)

      for(const subType of subTypes.values()) {
        assertType(subType)
      }

      this[$name] = name
      this[$subTypes] = subTypes
      this[$valueChecker] = valueChecker
    }

    get typeName() {
      return this[$name]
    }

    get subTypes() {
      return this[$subTypes]
    }

    get valueChecker() {
      return this[$valueChecker]
    }

    checkType(targetType) {
      assertType(targetType)

      if(!isInstanceOf(targetType, CompositeType))
        return new TypeError('target type must be a composite type')

      const { typeName, subTypes } = this

      if(typeName !== targetType.typeName)
        return new TypeError('target composite type have different name')

      const subTypes2 = targetType.subTypes
      if(subTypes.size !== subTypes2.size)
        return new TypeError('target composite type have different sub types')

      for(const [type1, type2] of zipIter(
        subTypes.values(), subTypes2.values()))
      {
        const err = type1.checkType(type2)
        if(err) return err
      }

      return null
    }

    checkValue(value) {
      const { subTypes, valueChecker } = this
      return valueChecker(subTypes, value)
    }
  })
